import {PAGE_INDEX} from "~/lib/pages"
import {BUS_MAIN_MENU_SET} from "~/plugins/bus";

export default {
  name: "HomePathMixin",
  methods: {
    set_home_path(path = "/") {
      this.$bus.$emit(BUS_MAIN_MENU_SET,{name:PAGE_INDEX, to: path})
    }
  }
}
