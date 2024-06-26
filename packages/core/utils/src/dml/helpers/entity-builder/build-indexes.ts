import { EntityIndex } from "@medusajs/types"
import { DMLSchema } from "../../../../dist/dml/entity-builder"
import { arrayDifference, isPresent } from "../../../common"

/*
  The DML provides an opinionated soft deletable entity as a part of every model
  We assume that deleted_at would be scoped in indexes in all cases as an index without the scope
  doesn't seem to be valid. If a case presents itself where one would like to remove the scope, 
  this will need to be updated to include that case.
*/
export function transformIndexWhere(index: EntityIndex) {
  let where = index.where
  const lowerCaseWhere = where?.toLowerCase()
  const whereIncludesDeleteable =
    lowerCaseWhere?.includes("deleted_at is null") ||
    lowerCaseWhere?.includes("deleted_at is not null")

  // If where scope does not include a deleted_at scope, we add a soft deletable scope to it
  if (where && !whereIncludesDeleteable) {
    where = where + ` AND deleted_at IS NULL`
  }

  // If where scope isn't present, we will set an opinionated where scope to the index
  if (!isPresent(where)) {
    where = "deleted_at IS NULL"
  }

  return where
}

/*
  The DML should strictly define indexes where the fields provided for the index are 
  already present in the schema definition. If not, we throw an error.
*/
export function validateIndexFields(index: EntityIndex, schema: DMLSchema) {
  const schemaFields: string[] = Object.keys(schema)
  const invalidFields = arrayDifference(index.fields, schemaFields)

  if (invalidFields.length) {
    throw new Error(
      `cannot find fields (${invalidFields.join(", ")}) in entity definition`
    )
  }
}