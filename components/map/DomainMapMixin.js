
import {mapGetters} from "vuex"
import FilterMixin from "~/components/FilterMixin"
import {transform_options_list} from "~/lib/options"
import DomainDataMixin from "~/components/domain/DomainDataMixin"

export default {
  name: "DomainMapMixin",
  mixins: [FilterMixin, DomainDataMixin],
  computed: {
    ...mapGetters({
      entries: "map/entries",
      layer_status: "map/layer_status"
    }),
    available_layers() {
      return this.$_.get(this.domain_data, "map.layers", [])
    },
    domain_templates_color_list() {
      const language = this.$store.getters["user/settings"].domain_language
      return this.templates_color_list(this.$store.getters["templates/templates_of_domain"](this.domain_name, language))
    }
  },
  methods: {
    set_layer_visibility(active_layers = []) {
      // instead of transform_options_list, map_loaded uses 'get'
      const options_layer_map = this.$_.keyBy(transform_options_list(this.available_layers), "value")
      for (let layer_name in options_layer_map) {
        const visibility = active_layers.includes(layer_name) ? "visible" : "none"
        const layerIds = this.$_.get(options_layer_map[layer_name], "additional", [layer_name])
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
