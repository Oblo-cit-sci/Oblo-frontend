import {all_pages_n_actions} from "~/lib/pages"

export default {
  name: "HomePathMixin",
  methods: {
    set_home_path(path = "/") {
      all_pages_n_actions[0].to = path
    }
  }
}
