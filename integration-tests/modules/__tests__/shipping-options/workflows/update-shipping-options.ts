import { ModuleRegistrationName } from "@medusajs/modules-sdk"
import {
  FulfillmentSetDTO,
  FulfillmentWorkflow,
  IFulfillmentModuleService,
  IRegionModuleService,
  ServiceZoneDTO,
  ShippingProfileDTO,
  UpdateShippingOptionsWorkflowInput,
} from "@medusajs/types"
import { medusaIntegrationTestRunner } from "medusa-test-utils/dist"
import {
  createShippingOptionsWorkflow,
  updateShippingOptionsWorkflow,
} from "@medusajs/core-flows"
import {
  ContainerRegistrationKeys,
  remoteQueryObjectFromString,
  RuleOperator,
} from "@medusajs/utils"

jest.setTimeout(100000)

const env = { MEDUSA_FF_MEDUSA_V2: true }
const provider_id = "manual_test-provider"

medusaIntegrationTestRunner({
  env,
  testSuite: ({ getContainer }) => {
    let service: IFulfillmentModuleService
    let container

    beforeAll(() => {
      container = getContainer()
      service = container.resolve(ModuleRegistrationName.FULFILLMENT)
    })

    describe("Fulfillment workflows", () => {
      let fulfillmentSet: FulfillmentSetDTO
      let serviceZone: ServiceZoneDTO
      let shippingProfile: ShippingProfileDTO

      beforeEach(async () => {
        shippingProfile = await service.createShippingProfiles({
          name: "test",
          type: "default",
        })

        fulfillmentSet = await service.create({
          name: "Test fulfillment set",
          type: "manual_test",
        })

        serviceZone = await service.createServiceZones({
          name: "Test service zone",
          fulfillment_set_id: fulfillmentSet.id,
          geo_zones: [
            {
              type: "country",
              country_code: "US",
            },
          ],
        })
      })

      it("should update shipping options", async () => {
        const regionService = container.resolve(
          ModuleRegistrationName.REGION
        ) as IRegionModuleService

        const [region] = await regionService.create([
          {
            name: "Test region",
            currency_code: "eur",
            countries: ["fr"],
          },
        ])

        const shippingOptionData: FulfillmentWorkflow.CreateShippingOptionsWorkflowInput =
          {
            name: "Test shipping option",
            price_type: "flat",
            service_zone_id: serviceZone.id,
            shipping_profile_id: shippingProfile.id,
            provider_id,
            type: {
              code: "manual-type",
              label: "Manual Type",
              description: "Manual Type Description",
            },
            prices: [
              {
                currency_code: "usd",
                amount: 10,
              },
              {
                region_id: region.id,
                amount: 100,
              },
            ],
            rules: [
              {
                attribute: "total",
                operator: RuleOperator.EQ,
                value: "100",
              },
            ],
          }

        const { result } = await createShippingOptionsWorkflow(container).run({
          input: [shippingOptionData],
        })

        const updateData: UpdateShippingOptionsWorkflowInput = {
          id: result[0].id,
          name: "Test shipping option",
          price_type: "flat",
          type: {
            code: "manual-type",
            label: "Manual Type",
            description: "Manual Type Description",
          },
        }

        await updateShippingOptionsWorkflow(container).run({
          input: [updateData],
        })

        const remoteQuery = container.resolve(
          ContainerRegistrationKeys.REMOTE_QUERY
        )

        const remoteQueryObject = remoteQueryObjectFromString({
          entryPoint: "shipping_option",
          variables: {
            id: result[0].id,
          },
          fields: [
            "id",
            "name",
            "price_type",
            "service_zone_id",
            "shipping_profile_id",
            "provider_id",
            "data",
            "metadata",
            "type.*",
            "created_at",
            "updated_at",
            "deleted_at",
            "shipping_option_type_id",
            "prices.*",
          ],
        })

        const [createdShippingOption] = await remoteQuery(remoteQueryObject)

        const prices = createdShippingOption.prices
        delete createdShippingOption.prices

        expect(createdShippingOption).toEqual(
          expect.objectContaining({
            id: result[0].id,
            name: updateData.name,
            price_type: updateData.price_type,
            service_zone_id: serviceZone.id,
            shipping_profile_id: shippingProfile.id,
            provider_id: provider_id,
            data: null,
            metadata: null,
            type: expect.objectContaining({
              id: expect.any(String),
              code: updateData.type.code,
              label: updateData.type.label,
              description: updateData.type.description,
            }),
            shipping_option_type_id: expect.any(String),
          })
        )

        expect(prices).toHaveLength(2)
        expect(prices).toContainEqual(
          expect.objectContaining({
            currency_code: "usd",
            amount: 10,
          })
        )
        expect(prices).toContainEqual(
          expect.objectContaining({
            currency_code: "eur",
            amount: 100,
            rules_count: 1,
          })
        )
      })

      it("should revert the shipping options", async () => {
        const regionService = container.resolve(
          ModuleRegistrationName.REGION
        ) as IRegionModuleService

        const [region] = await regionService.create([
          {
            name: "Test region",
            currency_code: "eur",
            countries: ["fr"],
          },
        ])

        const shippingOptionData: FulfillmentWorkflow.CreateShippingOptionsWorkflowInput =
          {
            name: "Test shipping option",
            price_type: "flat",
            service_zone_id: serviceZone.id,
            shipping_profile_id: shippingProfile.id,
            provider_id,
            type: {
              code: "manual-type",
              label: "Manual Type",
              description: "Manual Type Description",
            },
            prices: [
              {
                currency_code: "usd",
                amount: 10,
              },
              {
                region_id: region.id,
                amount: 100,
              },
            ],
            rules: [
              {
                attribute: "total",
                operator: RuleOperator.EQ,
                value: "100",
              },
            ],
          }

        const updateWorkflow = await updateShippingOptionsWorkflow(container)

        updateWorkflow.addAction(
          "throw",
          {
            invoke: async function failStep() {
              throw new Error(`Failed to update shipping options`)
            },
          },
          {
            noCompensation: true,
          }
        )

        const { result } = await createShippingOptionsWorkflow(container).run({
          input: [shippingOptionData],
        })

        const updateData: UpdateShippingOptionsWorkflowInput = {
          id: result[0].id,
          name: "Test shipping option",
          price_type: "flat",
          type: {
            code: "manual-type",
            label: "Manual Type",
            description: "Manual Type Description",
          },
        }

        const { errors } = await updateWorkflow.run({
          input: [updateData],
          throwOnError: false,
        })

        expect(errors).toHaveLength(1)
        expect(errors[0].error.message).toEqual(
          `Failed to update shipping options`
        )

        const remoteQuery = container.resolve(
          ContainerRegistrationKeys.REMOTE_QUERY
        )

        const remoteQueryObject = remoteQueryObjectFromString({
          entryPoint: "shipping_option",
          fields: [
            "id",
            "name",
            "price_type",
            "service_zone_id",
            "shipping_profile_id",
            "provider_id",
            "data",
            "metadata",
            "type.*",
            "created_at",
            "updated_at",
            "deleted_at",
            "shipping_option_type_id",
          ],
        })

        const createdShippingOptions = await remoteQuery(remoteQueryObject)

        expect(createdShippingOptions).toHaveLength(1)
        expect(createdShippingOptions[0]).toEqual(
          expect.objectContaining({
            name: shippingOptionData.name,
            price_type: shippingOptionData.price_type,
            service_zone_id: serviceZone.id,
            shipping_profile_id: shippingProfile.id,
            provider_id: provider_id,
            data: null,
            metadata: null,
            type: expect.objectContaining({
              id: expect.any(String),
              code: shippingOptionData.type.code,
              label: shippingOptionData.type.label,
              description: shippingOptionData.type.description,
            }),
          })
        )
      })
    })
  },
})
