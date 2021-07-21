import FilterMixin from "~/components/FilterMixin"
import {mapGetters} from "vuex";

export default {
  name: "EntrySearchMixin",
  mixins: [FilterMixin],
  computed: {
    ...mapGetters({act_config: "search/get_act_config"})
  },
  created() {
    this.debounced_search = this.$_.debounce(this.search_entries, 1000)
  },
  methods: {
    search_entries(config, offset = 0) {
      const prepend = config.required.some(r => r.name === "before_ts")
      this.$api.entries.search(
        this.$_.get(config, "page.limit", offset > 0 ? 20 : 40), // initially grab 40 (1page), then always 1 more
        this.$_.get(config, "page.offset", offset),
        config)
        .then(({data}) => {
          const count = data.data.count
          const entries = data.data.entries
          const all_uuids = data.data.all_uuids
          const entry_uuids = this.store_received_entries(entries)
          if (all_uuids) {
            if (prepend) {
              this.$store.commit("search/add_all_uuids", all_uuids)
            } else {
              this.$store.commit("search/set_all_uuids", all_uuids)
            }
          }
          if (offset === 0) {
            if (prepend) {
              this.$store.commit("search/prepend_entries", entry_uuids)
              this.$store.commit("search/increase_search_count", count)
            } else {
              this.$store.commit("search/set_entries", entry_uuids)
              this.$store.commit("search/set_search_count", count)
            }
            const ts = data.data.ts
            this.$store.commit("search/set_searchtime", ts)
          } else {
            this.$store.commit("search/append_entries", entry_uuids)
          }
          this.$store.commit("search/set_searching", false)
        }).catch(err => {
        console.log("search_entries err", err)
        this.$store.commit("search/set_searching", false)
      })
    },
    debounced_search() {
      // will be replaced in created...
    },
    store_received_entries(entries) {
      this.$store.dispatch("entries/save_entries", entries)
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
      return this.$api.entries.search(limit, offset, config)
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
        required: [this.get_actor_filter(this.$store.getters.username)]
      })
      if (my_entries_uuids_response.status === 200) {
        return Promise.resolve(my_entries_uuids_response.data.data)
      } else {
        console.log("couldnt get my uuids")
        return Promise.reject(my_entries_uuids_response)
      }
    },
    build_search_config(filters, keep_local = false) {
      const search_query = {required: [], include: []}
      for (let filter of filters) {
        if (!keep_local && filter.source_name === "local") {
          continue
        }
        if (filter.include_as) {
          search_query.include.push({name:filter.include_as, value: filter.value})
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
      for (let filter of filters) {
        local_entries = this.apply_filter(filter, local_entries)
      }
      return local_entries.map(e => e.uuid)
    },
    act_config_by_name(filter_name) {
      return this.$_.find(this.act_config, f => f.name === filter_name)
    }
  }
}
