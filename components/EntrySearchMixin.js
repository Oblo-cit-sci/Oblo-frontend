import {ENTRIES_SAVE_ENTRIES} from "~/store/entries"
import {DRAFT} from "~/lib/consts"

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
    async async_entry_search(config, offset = 0, limit = 40) {
      return this.$api.entries_search(limit, offset, config)
    },
    async get_complete_missing_meta(uuids) {
      /**
       * check which entries exists already and fetch the rest
       */
      const to_fetch = this.check_missing_meta(uuids)
      if (to_fetch.length === 0) {
        // todo, just resolve
        return Promise.resolve(true)
      }
      return this.get_entries_meta(uuids)
    },
    async get_entries_meta(uuids) {
      return this.$api.entries.by_uuids(uuids)
    },
    async get_my_entries_uuids() {
      // todo, maybe just a refresh...
      const my_entries_uuids_response = await this.$api.entries.get_uuids({
        required: [{
          name: "actor",
          registered_name: this.$store.getters.username
        }]
      })
      if (my_entries_uuids_response.status === 200) {
        return Promise.resolve(my_entries_uuids_response.data.data)
      } else {
        console.log("couldnt get my uuids")
        return Promise.reject(my_entries_uuids_response)
      }
    },
    build_search_config(filters, keep_local = false) {
      const search_query = {required: [], include: {}}
      for (let filter of filters) {
        if (!keep_local && filter.source_name === "local") {
          continue
        }
        if (filter.include_as) {
          search_query.include[filter.include_as] = filter.value
        } else {
          search_query.required.push(filter)
        }
      }
      return search_query
    },
    /**
     * returns uuids
     * @param filters search-filter array
     */
    local_search(filters) {
      let local_entries = this.$store.getters["entries/all_entries_array"]()
      console.log("alll-es", local_entries)
      console.log(local_entries.filter(e => e.status === DRAFT))
      for (let filter of filters) {
        console.log("f", filter)
        local_entries = this.apply_filter(filter, local_entries)
        console.log("->", local_entries)
      }
      return local_entries.map(e => e.uuid)
    }
  }
}
