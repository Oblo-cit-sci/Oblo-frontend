import {string_list2options} from "../../lib/options";

export default {
  name: "MapNavigationMixin",
  props: {
    drawer: Boolean,
    layers: Array
  },
  computed: {
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
    }
  },
}
