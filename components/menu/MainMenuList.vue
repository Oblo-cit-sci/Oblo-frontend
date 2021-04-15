<template lang="pug">
  div
    v-list
      v-list-item(v-for="item in filtered_pages" :key="item.icon" :href="item.to" :to="to(item)" :nuxt="is_nuxt(item)" :target="link_target(item)" @click="select(item)")
        v-list-item-icon()
          v-icon {{item.icon}}
        v-list-item-content()
          v-list-item-title(v-text="$t(item.t_title)")
        v-list-item-action
          v-btn(icon small v-if="show_close_btn(item)" @click="close_menu")
            v-icon  mdi-close
    v-divider
    LanguageSelector(v-if="show_language_selector")
</template>

<script>
import {all_pages_n_actions, PAGE_ABOUT, PAGE_INDEX} from "~/lib/pages"
import {DOMAIN, NO_DOMAIN} from "~/lib/consts"
import LanguageSelector from "~/components/LanguageSelector"
import URLQueryMixin from "~/components/util/URLQueryMixin"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import {mapGetters, mapMutations} from "vuex"
import ResponsivenessMixin from "~/components/ResponsivenessMixin"
import {is_standalone} from "~/lib/pwa";
import OfflineMixin from "~/lib/OfflineMixin"

let require_login = ["/profile", "/logout"]
let hide_logged_in = ["/login", "/register"]
let require_admin = ["/translate/setup"] // "/admin",
let hide_no_be = ["/register", "/login"] // if not connected out and if logged in out
let show_inDev = ["/tests"] //, "Types", "Entrytypes", "Aspectbuild"]
let hide_if_offline = ["register", "login", "users", "translate", "user_guide"]
let show_in_fixed_domain = []

export default {
  name: "MainMenuList",
  mixins: [URLQueryMixin, FixDomainMixin, ResponsivenessMixin, OfflineMixin],
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

      // console.log(this.is_offline)
      if(this.is_offline) {
        filtered_pages = filtered_pages.filter(p => !hide_if_offline.includes(p.name))
      }

      filtered_pages.forEach(p => {
        const alt_to = this.$store.getters["menu_page"](p.name)
        if(alt_to) {
          p.to = alt_to
        }
      })
      return filtered_pages
    },
    show_language_selector() {
      return !this.is_large
    }
  },
  created() {

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
    },
    is_nuxt(item) {
      if (typeof item.to === "string") {
        if (item.to.startsWith("https://")) {
          return false
        }
      }
      return true
    },
    link_target(item) {
      if (!this.is_nuxt(item))
        return "_blank"
    },
    to(item) {
      if (this.is_nuxt(item)) {
        return item.to
      }
    }
  }
}
</script>

<style scoped>

</style>
