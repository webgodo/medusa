export const defaultStoreCartFields = [
  "id",
  "currency_code",
  "email",
  "region_id",
  "created_at",
  "updated_at",
  "completed_at",
  "total",
  "subtotal",
  "tax_total",
  "discount_total",
  "discount_subtotal",
  "discount_tax_total",
  "original_total",
  "original_tax_total",
  "item_total",
  "item_subtotal",
  "item_tax_total",
  "original_item_total",
  "original_item_subtotal",
  "original_item_tax_total",
  "shipping_total",
  "shipping_subtotal",
  "shipping_tax_total",
  "original_shipping_tax_total",
  "original_shipping_subtotal",
  "original_shipping_total",
  "metadata",
  "promotions.id",
  "promotions.code",
  "promotions.is_automatic",
  "promotions.application_method.value",
  "promotions.application_method.type",
  "promotions.application_method.currency_code",
  "items.id",
  "items.product.id",
  "items.variant_id",
  "items.product_id",
  "items.product.categories.id",
  "items.product.tags.id",
  "items.product.collection_id",
  "items.product.type_id",
  "items.product_title",
  "items.product_description",
  "items.product_subtitle",
  "items.product_type",
  "items.product_collection",
  "items.product_handle",
  "items.variant_sku",
  "items.variant_barcode",
  "items.variant_title",
  "items.requires_shipping",
  "items.metadata",
  "items.created_at",
  "items.updated_at",
  "items.title",
  "items.quantity",
  "items.unit_price",
  "items.compare_at_unit_price",
  "items.is_tax_inclusive",
  "items.tax_lines.id",
  "items.tax_lines.description",
  "items.tax_lines.code",
  "items.tax_lines.rate",
  "items.tax_lines.provider_id",
  "items.adjustments.id",
  "items.adjustments.code",
  "items.adjustments.promotion_id",
  "items.adjustments.amount",
  "customer.id",
  "customer.email",
  "customer.groups.id",
  "shipping_methods.tax_lines.id",
  "shipping_methods.tax_lines.description",
  "shipping_methods.tax_lines.code",
  "shipping_methods.tax_lines.rate",
  "shipping_methods.tax_lines.provider_id",
  "shipping_methods.amount",
  "shipping_methods.is_tax_inclusive",
  "shipping_methods.adjustments.id",
  "shipping_methods.adjustments.code",
  "shipping_methods.adjustments.amount",
  "shipping_methods.shipping_option_id",
  "shipping_address.id",
  "shipping_address.first_name",
  "shipping_address.last_name",
  "shipping_address.company",
  "shipping_address.address_1",
  "shipping_address.address_2",
  "shipping_address.city",
  "shipping_address.postal_code",
  "shipping_address.country_code",
  "shipping_address.region_code",
  "shipping_address.province",
  "shipping_address.phone",
  "billing_address.id",
  "billing_address.first_name",
  "billing_address.last_name",
  "billing_address.company",
  "billing_address.address_1",
  "billing_address.address_2",
  "billing_address.city",
  "billing_address.postal_code",
  "billing_address.country_code",
  "billing_address.region_code",
  "billing_address.province",
  "billing_address.phone",
  "region.id",
  "region.name",
  "region.currency_code",
  "region.automatic_taxes",
  "*region.countries",
  "sales_channel_id",

  "payment_collection.id",
  "payment_collection.amount",
  "*payment_collection.payment_sessions",
]

export const retrieveTransformQueryConfig = {
  defaults: defaultStoreCartFields,
  allowed: [...defaultStoreCartFields.map((f) => f.replace("*", ""))],
  isList: false,
}
