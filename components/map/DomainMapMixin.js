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
      // const language = this.$store.getters["user/settings"].domain_language
      return this.templates_color_list(this.domain_templates(true))
      // return this.templates_color_list(this.$store.getters["templates/templates_of_domain"](this.domain_name, language))
    }
  },
  methods: {
    set_layer_visibility(active_layers = []) {
      /**
       * this now works with group:...
       * but does it still work with additional?
       * otherwise, additional can maybe be kicked out, in favor of groups only
       * @type {Dictionary<unknown>}
       */
      // instead of transform_options_list, map_loaded uses 'get'
      // console.log("active_layers", active_layers)
      const options_layer_map = this.$_.keyBy(transform_options_list(this.available_layers), "value")
      for (let layer_name of Object.keys(options_layer_map)) {
        const visibility = this.$_.map(active_layers,"value").includes(layer_name) ? "visible" : "none"
        // console.log("--", layer_name, visibility)
        const layerIds = this.$_.get(options_layer_map[layer_name], "additional", [layer_name])
        for (let layerId of layerIds) {
          if (layerId.startsWith("group:")) {
            const group_id = layerId.split(":")[1]
            // console.log("matching", group_id)764
            for (let layer of this.map.style.stylesheet.layers) {
              const layer_group_id = this.$_.get(layer.metadata, "mapbox:group", undefined)
              if (layer_group_id === group_id) {
                // console.log(layer.id, "--", visibility)
                this.map.setLayoutProperty(layer.id, 'visibility', visibility)
              }
            }
          } else {
            this.map.setLayoutProperty(layerId, 'visibility', visibility)
          }
        }
      }
      this.$store.commit("map/set_layer_status", active_layers)
    }
  },
  watch: {
    map_loaded() {
      // console.log("loaded")
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
