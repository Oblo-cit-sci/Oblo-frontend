import {MAP_SET_ENTRIES} from "~/store/map"

import {mapGetters} from "vuex"
import FilterMixin from "~/components/FilterMixin"
import DomainMixin from "~/components/DomainMixin"
import {transform_options_list} from "~/lib/options"

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
      layer_status: "map/layer_status"
    }),
    available_layers() {
      return this.$_.get(this.domain_data, "map.layers")
    },
  },
  methods: {
    load_map_entries() {
      // console.log("loading entries", this.$store.getters["map/loading_entries"])
      if (this.$store.getters["map/loading_entries"]) {
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
    },
    set_layer_visibility(active_layers = []) {
      // instead of transform_options_list, map_loaded uses 'get'
      const options_layer_map = this.$_.keyBy(transform_options_list(this.available_layers), "value")
      for (let layer_name in options_layer_map) {
        const visibility = active_layers.includes(layer_name) ? "visible" : "none"
        const layerIds = this.$_.get(options_layer_map[layer_name], "layers", [layer_name])
        for (let layerId of layerIds) {
          this.map.setLayoutProperty(layerId, 'visibility', visibility)
        }
      }
      this.$store.commit("map/set_layer_status", active_layers)
    }
  },
  watch: {
    map_loaded() {
      if (!this.layer_status) {
        // sometimes {value, text} sometimes just a string
        const available_layer_names = this.available_layers.map(l => this.$_.get(l, "value", l))
        // we just need this cuz mapbox doesnt give me the initial state of a layer. see method call below
        const default_active_layers = this.$_.get(this.domain_data, "map.default_active_layers", []).filter(l => available_layer_names.includes(l))
        this.set_layer_visibility(default_active_layers)
      }
    }
  }
}
