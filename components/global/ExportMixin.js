
const FileSaver = require('file-saver')


const regular_entry_base_meta_columns = [
  "uuid", "creation_ts", "domain", "template_version", "type", "last_edit_ts", "version", "title",
  "status", "description", "language", "privacy", "license", "image", "template", "template_version", "attached_files", "actors"
]

const straight_grab = ["uuid", "creation_ts", "domain", "template_version", "type", "last_edit_ts", "version", "title",
  "status", "description", "language", "privacy", "license", "image", "template_version"]


export default {
  name: "ExportMixin",
  methods: {
    transform_export_csv_data(data, filename) {
      const _csv = this.convert_entry(data)
      console.log(_csv)
      let csv = 'Name,Title\n'
      csv += "h,a\n"
      const blob = new Blob(
        [csv],
        {type: "data:text/csv;charset=utf-8"})
      FileSaver.saveAs(blob, filename + ".csv")
    },
    export_json_data(data, filename) {
      const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        {type: "text/json;charset=utf-8"})
      FileSaver.saveAs(blob, filename + ".json")
    },
    export_data(data, filename, format = "json") {
      if (format === "json") {
        this.export_json_data(data, filename)
      } else if (format === "csv") {
        this.transform_export_csv_data(data, filename)
      }
    },
    convert_entry(entry) {
      // get the template in the language
      const template = this.$store.getters["templates/entry_type"](entry.template.slug)
      const columns = this.get_columns(template)
      const values = this.get_column_values(entry)
      return [columns, values].join("\n")
    },
    get_columns(template_entry) {
      const columns = regular_entry_base_meta_columns.map(c => "meta." + c)
      //["tags", "location", "values"]

      return columns.join(", ")
    },
    get_column_values(entry, template_entry) {
      const meta_values = this.convert_meta_values(entry)
      return meta_values
    },
    convert_meta_values(entry) {
      // let csv = ""
      // for (let c in straight_grab) {
      //   entry
      // }
      return straight_grab.map(c => entry[c]).join(", ")
    }
  }
}
