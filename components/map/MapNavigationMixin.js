import {string_list2options} from "../../lib/options";
import {LOCATION, MODE_ASPECT_POINT, MODE_NORMAL} from "../../lib/consts";

export default {
  name: "MapNavigationMixin",
  props: {
    drawer: Boolean,
    layers: Array,
    mode: String
  },
  data() {
    return {
      location_pre_filter: [
        {
          name: "meta_aspect",
          meta_aspect_name: LOCATION
        }
      ]
    }
  },
  computed: {
    select_mode() {
      return this.mode === MODE_ASPECT_POINT
    },
    normal_mode() {
      return this.mode === MODE_NORMAL
    },
    layer_options() {
      return string_list2options(this.layers)
    }
  },
  methods: {
    back() {
      this.$router.back()
    },
    layer_select_change(active_layers) {
      this.$emit("layerstatus", active_layers)
    },
    update_map_entries(entries) {
      console.log("map nav, num results", entries.length)
      if(entries.length > 0) {
        console.log(entries[0])
      }
      this.$store.commit("map/set_entries", entries)
    },
  },
}
