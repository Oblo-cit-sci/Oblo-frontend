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
          }
        }
        for (let uuid of uuids) {
          console.log(this.$store.getters["entries/get_entry"](uuid).title)
        }
      }
      // console.log(data)
      // const missing_uuids = this.check_missing_meta(uuids)

      // const data2 = await this.$api.entries.by_uuids(data.data)
    },
    // async async_get_missing_meta(uuids) {
    //     const missing_uuids = this.check_missing_meta(uuids)
    //     const data = await this.$api.entries_get_uuids(missing_uuids)
    //     if (data.status === 200) {
    //       console.log(data.data)
    //       const meta = await this.$api.entries_by_uuid(data.data)
    //       console.log(meta)
    //       // entry.local = {}
    //       // this.$store.commit(ENTRIES_SAVE_ENTRY, entry)
    //     }
    // },
    async async_entry_search(api, config, offset = 0, limit = 40) {
      return api.entries_search(limit, offset, config)
    }
  }
}
