import {ENTRIES_HAS_FULL_ENTRY, ENTRIES_SAVE_ENTRY} from "~/store/entries"
import {VIEW} from "~/lib/consts"

export default {
  name: "EntryFetchMixin",
  methods: {
    async guarantee_entry(entry_uuid) {
      if (this.$store.getters[ENTRIES_HAS_FULL_ENTRY](entry_uuid)) {
        return Promise.resolve(this.$store.getters["entries/get_entry"](entry_uuid))
      } else {
        this.$api.entry__$uuid(entry_uuid).then(({data}) => {
          return Promise.resolve(data.data)
        }).catch(err => {
          console.log("error fetching entry")
          return Promise.reject(err)
        })
      }
    }
  }
}
