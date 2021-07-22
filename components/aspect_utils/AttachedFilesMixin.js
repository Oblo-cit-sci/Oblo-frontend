import {base64file_to_blob, common_filesize} from "~/lib/util";

/**
 * this is for aspects like ImageAspect.
 * type (similar to what the LoadFileButton proposes. json, image for now
 * internal_formats:
 - raw: str (e.g. base64 image)
 - loc: array for aspect location
 - url: url
 */

const uuidv4 = require('uuid/v4')

export default {
  name: "AttachedFilesMixin",
  methods: {
    add_file_attachment(entry_uuid_or_edit, type, file_uuid, file_loc) {
      this.$store.commit("entries/add_file_attachment", {entry_uuid_or_edit, type, file_uuid, file_loc})
    },
    remove_file_attachment(entry_uuid, file_uuid) {
      this.$store.commit("entries/remove_file_attachment", {entry_uuid, file_uuid})
    },
    get_attachments_to_post(entry) {
      const new_files_data = []
      for (let file of entry.attached_files) {
        if (!file.hasOwnProperty("url")) {
          new_files_data.push(file)
        }
      }
      return new_files_data
    },
    send_attachments(attachments_data, entry_uuid) {
      for (let attachment_data of attachments_data) {
        const file_uuid = attachment_data.file_uuid
        const stored_file = this.$store.getters["files/get_file"](file_uuid)
        if (stored_file) {
          const blob = base64file_to_blob(stored_file.meta.type, stored_file.data)
          const formData = new FormData()
          formData.append("file", blob, stored_file.meta.name)
          this.$api.entry.post_attachment(entry_uuid, file_uuid, formData).then((res) => {
            this.$store.commit("files/remove_file", file_uuid)
          }).catch(err => {
            this.error_snackbar("File could not be uploaded", stored_file.meta.name)
          })
        }
      }
    },
    max_file_size() {
      return common_filesize(8, "MB")
    },
    add_file(file) {
      const file_uuid = uuidv4()
      this.$store.commit("files/add_file", {uuid: file_uuid, meta: file.meta, data: file.data})
      this.update_value(this.$_.concat(this.value, [{
        // title: "",
        // description: "",
        file_uuid: file_uuid,
        url: null,
        date: new Date(),
        // license: "No license",
        meta: file.meta
      }]))
    }
  }
}
