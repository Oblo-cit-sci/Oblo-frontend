export function item_count_name(aspect, list_length) {
  const attr = aspect.attr || {}
  const name = attr.itemname || aspect.list_items.name || "item" // TODO language
  return list_length === 1 ? name :  (attr.itemname_plural || name + "s")
}
