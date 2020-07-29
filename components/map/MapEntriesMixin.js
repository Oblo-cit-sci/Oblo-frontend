import {mapGetters} from "vuex"

export default {
  name: "MapEntriesMixin",
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
    load_map_entries() {
      // console.log("loading entries", this.$store.getters["map/loading_entries"])
      this.$store.commit("map/set_entries_loaded", false)
      const config = {
        required: [this.get_domain_filter(this.domain)]
      }
      if (!this.$_.isEmpty(this.entries)) {
        config.required.push({name: "before_ts", ts: this.$store.getters["map/get_searchtime"]})
      }
      this.$api.entries_map_entries(config, true).then(({data}) => {
        this.$store.dispatch("map/add_entries", {domain: this.domain, entries: data.data.entries, ts: data.data.ts})
      }).catch(err => {
        console.log("map entries error")
        console.log(err)
      })
    }
  }
}
