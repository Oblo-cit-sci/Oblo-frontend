<template lang="pug">
  v-list
    v-list-item-group(v-for="group in groups" :key="group.name")
      v-list-item(v-for="item in group.items"
        :key="item.to"
        :to="item.to"
        router
        nuxt
        @click="item.action ? action(item.action) : ''"
        exact)
        v-list-item-icon
          v-icon {{item.icon}}
        v-list-item-content
          v-list-item-title(v-text="item.title")
    v-divider
    LanguageSelector
    v-list-item
      p(class="package-version") v{{version}}

</template>

<script>
  import {all_pages_n_actions} from "~/lib/pages"
  import {USER_GLOBAL_ROLE, USER_LOGGED_IN} from "~/store/user"
  import {ADMIN} from "~/lib/consts"
  import {APP_CONNECTED} from "~/store/app"
  import {mapGetters} from "vuex"
  import LanguageSelector from "~/components/LanguageSelector"
  import NotificationBanner from "~/components/global/NotificationBanner"

  const pkg = require('~/package.json')

  let require_login = ["menu.profile", "menu.logout"]
  let hide_logged_in = ["menu.login", "menu.register"]
  let require_admin = ["menu.admin"]
  let hide_no_be = ["menu.register", "menu.login"] // if not connected out and if logged in out
  let show_inDev = ["menu.tests"] //, "Types", "Entrytypes", "Aspectbuild"]


  export default {
    name: "MainMenuList",
    mixins: [],
    components: {NotificationBanner, LanguageSelector},
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
        for (let page of all_pages_n_actions) {
          page.title = this.$t(page.t_title)
        }
        const home = all_pages_n_actions[0]
        let other_pages = this.$_.tail(all_pages_n_actions)
        if (!this.connected) {
          other_pages = other_pages.filter(p => !hide_no_be.includes(p.t_title))
        }
        if (this.logged_in) {
          other_pages = other_pages.filter(p => !hide_logged_in.includes(p.t_title))
        } else {
          other_pages = other_pages.filter(p => !require_login.includes(p.t_title))
        }
        // console.log(this.$store.getters[USER_GLOBAL_ROLE])
        if (this.$store.getters[USER_GLOBAL_ROLE] !== ADMIN) {
          other_pages = other_pages.filter(p => !require_admin.includes(p.t_title))
        }
        if (process.env.NODE_ENV !== "development") {
          other_pages = other_pages.filter(p => !show_inDev.includes(p.t_title))
        } else {
          console.log("in DEV")
        }
        return [{name: "home", items: [home]},
          {name: "other", items: other_pages}]
      },
      version() {
        return pkg.version
      }
    },
    methods: {}
  }
</script>

<style scoped>

</style>
