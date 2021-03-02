import {all_pages_n_actions, PAGE_INDEX} from "~/lib/pages"

export default {
  name: "HomePathMixin",
  methods: {
    set_home_path(path = "/") {
      this.$bus.$emit("main-menu-set",{name:PAGE_INDEX, to: path})
    }
  }
}
