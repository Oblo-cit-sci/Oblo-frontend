<template lang="pug">
  v-list
    v-list-item-group(v-for="group in groups" :key="group.name")
      v-list-item(v-for="item in group.items"
        :key="item.to"
        :to="item.to"
        router
        nuxt
        @click="select(item)"
        exact)
        v-list-item-icon
          v-icon {{item.icon}}
        v-list-item-content
          v-list-item-title(v-text="$t(item.t_title)")
    v-divider
    LanguageSelector
</template>

<script>
import {all_pages_n_actions} from "~/lib/pages"
import {USER_GLOBAL_ROLE, USER_LOGGED_IN} from "~/store/user"
import {ADMIN} from "~/lib/consts"
import {APP_CONNECTED} from "~/store/app"
import LanguageSelector from "~/components/LanguageSelector"
import URLQueryMixin from "~/components/util/URLQueryMixin"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import {mapGetters, mapMutations} from "vuex"

let require_login = ["/profile", "/logout"]
let hide_logged_in = ["/login", "/register"]
let require_admin = ["/admin"]
let hide_no_be = ["/register", "/login"] // if not connected out and if logged in out
let show_inDev = ["/tests"] //, "Types", "Entrytypes", "Aspectbuild"]
let show_in_fixed_domain = ["/about"]

export default {
  name: "MainMenuList",
  mixins: [URLQueryMixin, FixDomainMixin],
  components: {LanguageSelector},
  props: {},
  data() {
    return {}
  },
  computed: {
    ...mapGetters({
        logged_in: USER_LOGGED_IN,
        connected: APP_CONNECTED
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
      // console.log(this.$store.getters[USER_GLOBAL_ROLE])
      if (this.$store.getters[USER_GLOBAL_ROLE] !== ADMIN) {
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
    select(item) {
      if (item.action) {
        action(item.action)
      }
      // doesnt apply for "home" for fixed_domain since that has a query param
      if (item.to === this.$route.path) {
        this.switch_menu_open()
      }
    }
  }
}
</script>

<style scoped>

</style>
