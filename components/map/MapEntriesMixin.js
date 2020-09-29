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
    }),
    get_all_uuids() {
      return this.all_uuids()
    },
  },
  methods: {
    load_map_entries(domain_name) {
      // console.log("loading entries", this.$store.getters["map/loading_entries"])
      this.$store.commit("map/set_entries_loaded", false)
      const config = {
        required: [this.get_domain_filter(domain_name)]
      }
      if (!this.$_.isEmpty(this.entries)) {
        config.required.push({name: "before_ts", ts: this.$store.getters["map/get_searchtime"]})
      }
      this.$api.entries_map_entries(config, true).then(({data}) => {
        // console.log(data.data)
        this.$store.dispatch("map/add_entries", {domain: domain_name, entries: data.data.entries, ts: data.data.ts})
      }, err => {
        console.log("map entries error")
        console.log(err)
      })
    },
    guarantee_entries_loaded() {
      if (!this.entries_loaded) {

      }
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
