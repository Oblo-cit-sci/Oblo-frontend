<template lang="pug">
  v-navigation-drawer(
    :value="nav_drawer"
    v-show="show"
    app)
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
      v-list-item
        p(class="package-version") v{{version}}

</template>

<script>
  import {all_pages_n_actions} from "~/lib/pages"
  import {USER_GLOBAL_ROLE, USER_LOGGED_IN} from "~/store/user"
  import {ADMIN} from "~/lib/consts"
  import {APP_CONNECTED} from "~/store/app"
  import {mapGetters} from "vuex"
  import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
  import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
  import NavBaseMixin from "~/components/NavBaseMixin"

  const pkg = require('~/package')

  let require_login = ["Profile", "Logout"]
  let hide_logged_in = ["Login", "Register"]
  let require_admin = ["Admin"]
  let hide_no_be = ["Register", "Login"] // if not connected out and if logged in out
  let show_inDev = ["Tests"] //, "Types", "Entrytypes", "Aspectbuild"]

  export default {
    name: "MainMenu",
    mixins: [TriggerSnackbarMixin, PersistentStorageMixin, NavBaseMixin],
    components: {},
    props: {
      show: Boolean,
    },
    data() {
      return {}
    },
    computed: {
      ...mapGetters({
        logged_in: USER_LOGGED_IN,
        connected: APP_CONNECTED,
        nav_drawer: "app/nav_drawer"
      }),
      groups() {
        const home = all_pages_n_actions[0]
        let other_pages = this.$_.tail(all_pages_n_actions)
        if (!this.connected) {
          other_pages = other_pages.filter(p => !hide_no_be.includes(p.title))
        }
        if (this.logged_in) {
          other_pages = other_pages.filter(p => !hide_logged_in.includes(p.title))
        } else {
          other_pages = other_pages.filter(p => !require_login.includes(p.title))
        }
        if (this.$store.getters[USER_GLOBAL_ROLE] !== ADMIN) {
          other_pages = other_pages.filter(p => !require_admin.includes(p.title))
        }
        if (process.env.NODE_ENV !== "development") {
          other_pages = other_pages.filter(p => !show_inDev.includes(p.title))
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
