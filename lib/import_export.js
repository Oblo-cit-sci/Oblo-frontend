
import {convert_entry} from "~/lib/entry_csv_convert"

const FileSaver = require('file-saver');
const ld = require("lodash")

export function transform_export_csv_data(data, filename) {

  const _csv = convert_entry(data, this.$store)
  console.log(_csv)
  let csv = 'Name,Title\n'
  csv += "h,a\n"
  const blob = new Blob(
    [csv],
    {type: "data:text/csv;charset=utf-8"})
  FileSaver.saveAs(blob, filename+ ".csv")
}

export function export_json_data(data, filename) {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    {type: "text/json;charset=utf-8"})
  FileSaver.saveAs(blob, filename + ".json")
}

export function export_data(data, filename, format = "json") {
  if (format === "json") {
    export_json_data(data, filename)
  } else if (format === "csv") {
    transform_export_csv_data(data, filename)
  }
}



function get_entry_from_dict(uuid, entry_dict) {
  if (entry_dict.hasOwnProperty(uuid)) {
    return entry_dict[uuid]
  } else {
    console.log("Recursive children function. Entry lists child uuid that is not contained in the dictionary", uuid)
    return null
  }
}

function recursive_straight_insert(store, entry, entry_dict) {
  // console.log("rec-straight", entry.title)
  let new_entries = []
  if (store.getters["entries/has_entry"](entry.uuid)) {
    // todo we could also go to merge...
    console.log(`Recursive straight import failed for ${entry.title}. Aborting for all children`)
    return []
  }
  const entry_type = store.getters["templates/entry_type"](entry.type_slug)

  if (entry_type) {
    store.commit("entries/save_entry", entry)
    new_entries.push(entry)
    for (let child_uuid in entry.entry_refs.children || {}) {
      const child_entry = get_entry_from_dict(child_uuid, entry_dict)
      if (child_entry) {
        Array.prototype.push.apply(new_entries, recursive_straight_insert(store, child_entry, entry_dict))
      }
    }
  } else {
    console.log("skipping entry for unknown type", entry.type_slug)
  }
  return new_entries
}

