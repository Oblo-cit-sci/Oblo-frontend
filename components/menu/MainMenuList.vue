<template lang="pug">
  v-list
    v-list-item-group(v-for="group in groups" :key="group.name")
      v-list-item(v-for="item in group.items" :key="item.to")
        v-list-item-icon(@click="select(item)")
          v-icon {{item.icon}}
        v-list-item-content(@click="select(item)")
          v-list-item-title(v-text="$t(item.t_title)")
        v-list-item-action
          v-btn(icon small v-if="show_close_btn(item)" @click="close_menu")
            v-icon  mdi-close
    v-divider
    LanguageSelector
</template>

<script>
import {all_pages_n_actions} from "~/lib/pages"
import {ADMIN, DOMAIN} from "~/lib/consts"
import LanguageSelector from "~/components/LanguageSelector"
import URLQueryMixin from "~/components/util/URLQueryMixin"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import {mapGetters, mapMutations} from "vuex"
import ResponsivenessMixin from "~/components/ResponsivenessMixin"

let require_login = ["/profile", "/logout"]
let hide_logged_in = ["/login", "/register"]
let require_admin = ["/admin", "/translate/setup"]
let hide_no_be = ["/register", "/login"] // if not connected out and if logged in out
let show_inDev = ["/tests"] //, "Types", "Entrytypes", "Aspectbuild"]
let show_in_fixed_domain = ["/about"]

export default {
  name: "MainMenuList",
  mixins: [URLQueryMixin, FixDomainMixin, ResponsivenessMixin],
  components: {LanguageSelector},
  props: {},
  data() {
    return {}
  },
  computed: {
    ...mapGetters({
        logged_in: "user/logged_in",
        connected: "app/connected"
      }
    ),
    groups() {
      const home = all_pages_n_actions[0]
      let other_pages = this.$_.tail(all_pages_n_actions)
      if (!this.connected) {
        other_pages = other_pages.filter(p => !hide_no_be.includes(p.to))
      }
      if (this.logged_in) {
        other_pages = other_pages.filter(p => !hide_logged_in.includes(p.to))
      } else {
        other_pages = other_pages.filter(p => !require_login.includes(p.to))
      }
      if (!this.$store.getters["user/is_admin"]) {
        other_pages = other_pages.filter(p => !require_admin.includes(p.to))
      }
      if (process.env.NODE_ENV !== "development") {
        other_pages = other_pages.filter(p => !show_inDev.includes(p.to))
      }

      if (this.is_fixed_domain) {
        // other_pages = other_pages.filter(p => !show_in_fixed_domain.includes(p.t_title))
      } else {
        other_pages = other_pages.filter(p => !show_in_fixed_domain.includes(p.to))
      }

      return [{name: "home", items: [home]},
        {name: "other", items: other_pages}]
    }
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
      // console.log("select", item)
      if (item.action) {
        action(item.action)
      }
      // doesnt apply for "home" for fixed_domain since that has a query param
      let route_name = item.to
      if (item.to.indexOf("?") !== -1)
        route_name = item.to.substring(0, item.to.indexOf("?"))
      // console.log(item.to, route_name, this.$route.path)
      if (route_name === this.$route.path) {
        this.switch_menu_open()
      }
      this.$router.push(item.to)
    }
  }
}
</script>

<style scoped>

</style>
