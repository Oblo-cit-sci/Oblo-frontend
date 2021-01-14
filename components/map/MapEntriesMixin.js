import {mapGetters} from "vuex"
import EntrySearchMixin from "~/components/EntrySearchMixin"

export default {
  name: "MapEntriesMixin",
  mixins: [EntrySearchMixin],
  computed: {
    ...mapGetters({
      entries_loaded: "map/entries_loaded",
      all_map_entries: "map/entries",
      all_uuids: "search/get_all_uuids",
      get_search_time: "map/get_search_time"
    }),
    get_all_uuids() {
      return this.all_uuids()
    },
  },
  methods: {
    async load_map_entries(domain_name) {
      // console.log("loading entries", this.$store.getters["map/loading_entries"])
      this.$store.commit("map/set_entries_loaded", false)
      const config = {
        required: [this.get_domain_filter(domain_name)]
      }
      if (!this.$_.isEmpty(this.entries)) {
        const search_time = this.get_search_time
        if(search_time) {
          config.required.push({name: "before_ts", ts: search_time})
        }
      }
      const {data} = await this.$api.entries.map_entries(config, true)
      // console.log(data.data.entries.features.length)
      await this.$store.dispatch("map/add_entries", {domain: domain_name, entries: data.data.entries, ts: data.data.ts})
    },
    get_my_locations() {
      // this.guarantee_entries_loaded()
      const my_uuids = this.get_my_entries_uuids()
    },
    get_map_entries_by_uuids(uuids) {
      // this.guarantee_entries_loaded()
      return this.$store.getters["map/get_by_uuids"](uuids)
    }
  }
}
