/**
 * this is for aspects like ImageAspect.
 * type (similar to what the LoadFileButton proposes. json, image for now
 * internal_formats:
    - raw: str (e.g. base64 image)
    - loc: array for aspect location
    - url: url
 */

export default {
  name: "AttachedFilesMixin",
  methods: {
    add_file_attachment(entry_uuid_or_edit, type, file_uuid, file_loc) {
      this.$store.commit("entries/add_file_attachment", {entry_uuid_or_edit, type, file_uuid, file_loc})
    },
    remove_file_attachment(entry_uuid, file_uuid) {
      this.$store.commit("entries/remove_file_attachment", {entry_uuid, file_uuid})
    }
  }
}
