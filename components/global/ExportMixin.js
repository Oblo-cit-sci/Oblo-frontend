import {REGULAR} from "~/lib/consts";

const FileSaver = require('file-saver')

/**
 * DEPRACATED MODULE!!!
 */

// const regular_entry_base_meta_columns = [
//   "uuid", "creation_ts", "domain", "template_version", "type", "last_edit_ts", "version", "title",
//   "status", "description", "language", "privacy", "license", "image", "template", "template_version", "attached_files", "actors"
// ]
//
// const straight_grab = ["uuid", "creation_ts", "domain", "template_version", "type", "last_edit_ts", "version", "title",
//   "status", "description", "language", "privacy", "license", "image", "template_version"]


export default {
  name: "ExportMixin",
  methods: {
    download_csv(data, filename) {
      // const _csv = this.convert_entry(data)
      const blob = new Blob(
        [data],
        {type: "data:text/csv;charset=utf-8"})
      FileSaver.saveAs(blob, filename + ".csv")
    },
    download_json(data, filename) {
      const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        {type: "text/json;charset=utf-8"})
      FileSaver.saveAs(blob, filename + ".json")
    },
    prepare_entry_for_download(entry) {
      const copy = this.$_.cloneDeep(entry)
      if (entry.type === REGULAR) {
        for(let key of ["aspects","rules", "entry_refs", "slug", "local"]) {
          delete copy[key]
        }
      }
      return copy
    },
    export_data(data, filename, format = "json") {
      if (format === "json") {
        this.download_json(data, filename)
      } else if (format === "csv") {
        this.download_csv(data, filename)
      }
    }
  }
}
