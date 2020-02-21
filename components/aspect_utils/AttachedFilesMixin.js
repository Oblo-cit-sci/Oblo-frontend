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
    add_file_attachment(entry_uuid, type, file_uuid) {
      this.$store.commit(ENTRIES_ADD_FILE_ATTACHMENT, {entry_uuid, type, file_uuid})
    }
  }
}
