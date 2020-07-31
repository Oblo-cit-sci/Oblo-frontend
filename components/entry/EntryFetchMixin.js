import {ENTRIES_HAS_FULL_ENTRY, ENTRIES_SAVE_ENTRY} from "~/store/entries"
import {VIEW} from "~/lib/consts"

export default {
  name: "EntryFetchMixin",
  methods: {
    async guarantee_entry(entry_uuid) {
      if (this.$store.getters[ENTRIES_HAS_FULL_ENTRY](entry_uuid)) {
        return Promise.resolve(this.$store.getters["entries/get_entry"](entry_uuid))
      } else {
        const entry_response = await this.$api.entry__$uuid(entry_uuid)
        if(entry_response.status === 200) {
          const entry = entry_response.data.data
          // todo: maybe do more stuff. preparing?
          this.$store.commit(ENTRIES_SAVE_ENTRY, entry)
          return Promise.resolve(entry)
        } else {
          return Promise.reject(entry_response)
        }
      }
    }
  }
}
