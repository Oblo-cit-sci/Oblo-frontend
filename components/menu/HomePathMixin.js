import {PAGE_INDEX} from "~/lib/pages"

export default {
  name: "HomePathMixin",
  methods: {
    set_home_path(domain_name) {
      if(domain_name) {
        this.$store.commit("app/set_menu_to", {name: "domain", to: `/domain?f=${domain_name}`})
      } else {
        const domain_names = this.$store.getters["domain/all_domains_names"]()
        if (domain_names.length > 0)
          this.$store.commit("app/set_menu_to", {name: "domain", to: "/"})
        else {
          this.$store.commit("app/set_menu_to", {name: "domain", to: `/domain?f=${domain_names[0]}`})
        }
      }
    }
  }
}
