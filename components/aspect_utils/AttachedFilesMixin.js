/**
 * this is for aspects like ImageAspect.
 * type (similar to what the LoadFileButton proposes. json, image for now
 * internal_formats:
    - raw: str (e.g. base64 image)
    - loc: array for aspect location
    - url: url
 */
import {ENTRIES_ADD_FILE_ATTACHMENT} from "~/lib/store_consts";

export default {
  name: "AttachedFilesMixin",
  methods: {
    add_file_attachment(entry_uuid, type, internal_format, file_uuid, file_data) {
      this.$store.commit(ENTRIES_ADD_FILE_ATTACHMENT, {entry_uuid, type, internal_format, file_uuid})
      this.$store.commit("files/add_file", {uuid: file_uuid, data: file_data})
    },
    get_attachments_to_post(entry) {
      const new_files_data = []
      for(let file of entry.attached_files) {
        console.log(file)
        if(file.internal_format === "loc") {
          const attachment_data =
            new_files_data.push(attachment_data)
        }
      }
      return new_files_data
    }
  }
}
