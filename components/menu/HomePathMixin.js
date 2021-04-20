import {PAGE_INDEX} from "~/lib/pages"

export default {
  name: "HomePathMixin",
  methods: {
    set_home_to_offline() {
      this.$store.commit("app/set_menu_to", {name: "index", to: "/offline"})
    },
    set_home_path_domain(domain_name, fixed = false) {
      if (fixed)
        this.$store.commit("app/set_menu_to", {name: "index", to: `/domain?f=${domain_name}`})
      else
        this.$store.commit("app/set_menu_to", {name: "index", to: `/domain?d=${domain_name}`})
    },
    reset_home() {
      const domain_names = this.$store.getters["domain/all_domains_names"]()
      if (domain_names.length > 0) {
        this.$store.commit("app/set_menu_to", {name: "index", to: "/"})
        return
      }
      this.$store.commit("app/set_menu_to", {name: "index", to: `/domain?f=${domain_names[0]}`})
    }
  }
}
