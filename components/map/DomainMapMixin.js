import {MAP_SET_ENTRIES} from "~/store/map"

import {mapGetters} from "vuex"
import FilterMixin from "~/components/FilterMixin"
import DomainMixin from "~/components/DomainMixin"

export default {
  name: "DomainMapMixin",
  mixins: [FilterMixin, DomainMixin],
  props: {
    domain: {
      type: String
    }
  },
  computed: {
    ...mapGetters({
      entries: "map/entries",
      layers: "map/layers",
      layer_status: "map/layer_status"
    })
  },
  methods: {
    load_map_entries() {
      console.log("loading entries", this.$store.getters["map/loading_entries"])
      if(this.$store.getters["map/loading_entries"]) {
        console.warn("catching double page create")
        return
      }
      this.$store.commit("map/set_entries_loaded", false)
      this.$store.commit("map/set_loading_entries", true)
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
