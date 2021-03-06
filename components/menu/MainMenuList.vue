<template lang="pug">
  div
    v-list
      v-list-item(v-for="item in filtered_pages" :key="item.icon"
        :href="item.to" :to="to(item)" :nuxt="is_nuxt(item)" :target="link_target(item)")
        v-list-item-icon
          v-icon {{item.icon}}
        v-list-item-content
          v-list-item-title(v-text="$t(item.t_title)")
        // todo fix: triggering item select...
        //v-list-item-action()
        //  v-btn(icon small v-if="show_close_btn(item)" @click="close_menu($event)")
        //    v-icon  mdi-close
    v-divider
    LanguageSelector(v-if="show_language_selector")
    div(v-if="is_dev")
      v-btn(@click="switch_offline") {{dev_offline_switch_button_label}}
</template>

<script>
import {all_pages_n_actions, PAGE_ABOUT, PAGE_INDEX, PAGE_LOGIN} from "~/lib/pages"
import {DOMAIN, INDEX, NO_DOMAIN} from "~/lib/consts"
import LanguageSelector from "~/components/LanguageSelector"
import URLQueryMixin from "~/components/util/URLQueryMixin"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import {mapGetters, mapMutations} from "vuex"
import ResponsivenessMixin from "~/components/ResponsivenessMixin"
import OfflineMixin from "~/lib/OfflineMixin"
import EnvMixin from "~/components/global/EnvMixin"

let require_login = ["profile", "logout"]
let hide_logged_in = ["login", "register"]
let require_editor = ["translate"]
let require_admin = []  // "/admin",
let hide_no_be = ["register", "login"] // if not connected out and if logged in out
let show_inDev = ["tests"] //, "Types", "Entrytypes", "Aspectbuild"]
let hide_if_offline = ["register", PAGE_LOGIN, "users", "translate", "user_guide", "profile"]
let show_in_fixed_domain = []
let hide_on_login_required = ["users"] // hide these options, if the platform requires login

export default {
  name: "MainMenuList",
  mixins: [URLQueryMixin, FixDomainMixin, ResponsivenessMixin, OfflineMixin, EnvMixin],
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
    dev_offline_switch_button_label() {
      return this.is_offline ? "S/ON" : "S/OFF"
    },
    filtered_pages() {
      // console.log("filter page update")
      let filtered_pages = this.pages
      if (!this.connected) {
        filtered_pages = filtered_pages.filter(p => !hide_no_be.includes(p.name))
      }
      if (this.logged_in) {
        filtered_pages = filtered_pages.filter(p => !hide_logged_in.includes(p.name))
      } else {
        filtered_pages = filtered_pages.filter(p => !require_login.includes(p.name))
      }
      if (!this.$store.getters["user/is_editor_or_admin"]) {
        filtered_pages = filtered_pages.filter(p => !require_editor.includes(p.name))
      }
      if (!this.$store.getters["user/is_admin"]) {
        filtered_pages = filtered_pages.filter(p => !require_admin.includes(p.name))
      }
      // console.log(this.$nuxt.context.env, this.$store.getters.name)
      if (process.env.NODE_ENV !== "development" && !(this.$nuxt.context.env.SERVER === "staging" && this.$store.getters.name === "admin")) {
        filtered_pages = filtered_pages.filter(p => !show_inDev.includes(p.name))
      }

      if (!this.is_fixed_domain) {
        filtered_pages = filtered_pages.filter(p => !show_in_fixed_domain.includes(p.name))
      }

      const platform_data = this.$store.getters["app/platform_data"]
      if(platform_data.login_required && !this.logged_in) {
        filtered_pages = filtered_pages.filter(p => !hide_on_login_required.includes(p.name))
      }

      const about = this.$_.find(filtered_pages, p => p.name === PAGE_ABOUT)
      if (this.act_domain_name !== NO_DOMAIN &&
        this.$route.name !== PAGE_INDEX) {
        about.to.query = {d: this.$store.getters["domain/act_domain_name"]}
      } else {
        about.to.query = {}
      }

      // if not stand-alone, remove offline_settings
      if (!this.is_standalone) {
        // console.log("kicking out 'offline settings'")
        filtered_pages = filtered_pages.filter(p => p.name !== "offline_settings")
      }

      // console.log(this.is_offline)
      if (this.is_offline) {
        filtered_pages = filtered_pages.filter(p => !hide_if_offline.includes(p.name))
      }

      filtered_pages.forEach(p => {
        const alt_to = this.$store.getters["menu_page"](p.name)
        if (alt_to) {
          p.to = alt_to
        }
      })
      // will throw out user_guide if it is not set
      filtered_pages= filtered_pages.filter(page => page.to !== null)
      return filtered_pages
    },
    show_language_selector() {
      return !this.is_large
    }
  },
  methods: {
    ...mapMutations({switch_menu_open: 'menu/switch_open'}),
    show_close_btn(item) {
      return item.name === INDEX && this.$route.name !== DOMAIN && this.is_small
    },
    close_menu($event) {
      this.$store.commit("menu/open", false)
    },
    // select(item) {
    //   console.log("sel", item)
    //   this.close_menu()
    // },
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
