import {string_list2options} from "../../lib/options";
import {MODE_ASPECT_POINT, MODE_NORMAL} from "../../lib/consts";

export default {
  name: "MapNavigationMixin",
  props: {
    drawer: Boolean,
    layers: Array,
    mode: String
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
      console.log(entries.length)
      // this.$store.commit("map/set_entries", entries)
    },
  },
}
