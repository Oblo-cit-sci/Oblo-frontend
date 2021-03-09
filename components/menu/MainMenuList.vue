<template lang="pug">
  div
    v-list
      v-list-item(v-for="item in filtered_pages" :key="item.icon" :to="item.to" nuxt @click="select(item)")
        v-list-item-icon()
          v-icon {{item.icon}}
        v-list-item-content()
          v-list-item-title(v-text="$t(item.t_title)")
        v-list-item-action
          v-btn(icon small v-if="show_close_btn(item)" @click="close_menu")
            v-icon  mdi-close
    v-divider
    LanguageSelector
</template>

<script>
import {all_pages_n_actions, PAGE_ABOUT, PAGE_INDEX} from "~/lib/pages"
import { DOMAIN, NO_DOMAIN} from "~/lib/consts"
import LanguageSelector from "~/components/LanguageSelector"
import URLQueryMixin from "~/components/util/URLQueryMixin"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import {mapGetters, mapMutations} from "vuex"
import ResponsivenessMixin from "~/components/ResponsivenessMixin"
import {is_standalone} from "~/lib/pwa";

let require_login = ["/profile", "/logout"]
let hide_logged_in = ["/login", "/register"]
let require_admin = ["/translate/setup"] // "/admin",
let hide_no_be = ["/register", "/login"] // if not connected out and if logged in out
let show_inDev = ["/tests"] //, "Types", "Entrytypes", "Aspectbuild"]
let show_in_fixed_domain = []

export default {
  name: "MainMenuList",
  mixins: [URLQueryMixin, FixDomainMixin, ResponsivenessMixin],
  components: {LanguageSelector},
  props: {},
  data() {
    const pages = all_pages_n_actions
    return {
      pages
    }
  },
  computed: {
    ...mapGetters({
        logged_in: "user/logged_in",
        connected: "app/connected",
        act_domain_name: "domain/act_domain_name"
      }
    ),
    filtered_pages() {
      // const home = all_pages_n_actions[0]
      let filtered_pages = this.pages
      if (!this.connected) {
        filtered_pages = filtered_pages.filter(p => !hide_no_be.includes(p.to))
      }
      if (this.logged_in) {
        filtered_pages = filtered_pages.filter(p => !hide_logged_in.includes(p.to))
      } else {
        filtered_pages = filtered_pages.filter(p => !require_login.includes(p.to))
      }
      if (!this.$store.getters["user/is_admin"]) {
        filtered_pages = filtered_pages.filter(p => !require_admin.includes(p.to))
      }
      if (process.env.NODE_ENV !== "development") {
        filtered_pages = filtered_pages.filter(p => !show_inDev.includes(p.to))
      }

      if (!this.is_fixed_domain) {
        filtered_pages = filtered_pages.filter(p => !show_in_fixed_domain.includes(p.to))
      }

      const about = this.$_.find(filtered_pages, p => p.name === PAGE_ABOUT)
      if (this.act_domain_name !== NO_DOMAIN &&
        this.$route.name !== PAGE_INDEX) {
        about.to.query = {d: this.$store.getters["domain/act_domain_name"]}
      } else {
        about.to.query = {}
      }

      // if not stand-alone, remove offline_settings
      if (!is_standalone()) {
        filtered_pages = filtered_pages.filter(p => p.name !== "offline_settings")
      }
      return filtered_pages
    }
  },
  created() {
    this.$bus.$on("main-menu-set", ({name, to}) => {
      const page = this.$_.find(this.pages, p => p.name === name)
      if (page) {
        page.to = to
      }
    })
  },
  methods: {
    ...mapMutations({switch_menu_open: 'menu/switch_open'}),
    show_close_btn(item) {
      return item.id === 'home' && this.$route.name !== DOMAIN && this.is_small
    },
    close_menu() {
      this.$store.commit("menu/open", false)
    },
    select(item) {
      this.close_menu()
    }
  }
}
</script>

<style scoped>

</style>
