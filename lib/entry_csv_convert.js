
export function convert_entry(entry, store) {
  // get the template in the language
  const template = store.getters["templates/entry_type"](entry.template.slug)
  const columns = get_columns(template)
  const values = get_column_values(entry)
  return columns + values
}

export function get_columns(template_entry) {
  const columns = regular_entry_base_meta_columns.map(c => "meta." + c)
    //["tags", "location", "values"]

  return columns.join(", ") + "\n"
}

export function get_column_values(entry, template_entry) {
  const meta_values = convert_meta_values(entry)
  return meta_values + "\n"
}

const regular_entry_base_meta_columns = [
  "uuid", "creation_ts", "domain", "template_version", "type", "last_edit_ts", "version", "title",
  "status", "description", "language", "privacy", "license", "image", "template", "template_version", "attached_files", "actors"
]

const straight_grab = ["uuid", "creation_ts", "domain", "template_version", "type", "last_edit_ts", "version", "title",
  "status", "description", "language", "privacy", "license", "image", "template", "template_version"]

function convert_meta_values(entry) {
  // let csv = ""
  // for (let c in straight_grab) {
  //   entry
  // }
  return straight_grab.map(c => entry.c).join(", ")
}

