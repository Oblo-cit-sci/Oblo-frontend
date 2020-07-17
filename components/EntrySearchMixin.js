import {ENTRIES_SAVE_ENTRIES} from "~/store/entries"

export default {
  name: "EntrySearchMixin",
  methods: {
    store_received_entries(entries) {
      this.$store.commit(ENTRIES_SAVE_ENTRIES, entries)
      return entries.map(e => e.uuid)
    },
    check_missing_meta(uuids) {
      return uuids.filter(u => !this.$store.getters["entries/has_entry"](u))
    },
    async async_complete_meta(config) {
      /**
       * gets for a config the uuids, the for the missing entries the meta again.
       * resolves with the uuids
       */
      const data = await this.$api.entries.get_uuids(config)
      if (data.status === 200) {
        const uuids = data.data.data
        // console.log(uuids)
        const missing_uuids = this.check_missing_meta(uuids)
        if (!this.$_.isEmpty(missing_uuids)) {
          const data = await this.$api.entries.by_uuids(missing_uuids)
          if (data.status === 200) {
            // todo, why is this so absurd?!?
            this.store_received_entries(data.data.data.entries)
          } else {
            return Promise.reject("cannot get entries")
          }
        }
        return Promise.resolve(uuids)
      } else {
        return Promise.reject("cannot get uuids")
      }
    },
    async async_entry_search(api, config, offset = 0, limit = 40) {
      return api.entries_search(limit, offset, config)
    }
  }
}
