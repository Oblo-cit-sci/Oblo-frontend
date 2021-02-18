import {all_pages_n_actions} from "~/lib/pages"

export default {
  name: "HomePathMixin",
  methods: {
    set_home_path(path = "/") {
      // console.log("HomePathMixin:set_domain_as_home_path to ", path)
      all_pages_n_actions[0].to = path
    }
  }
}
