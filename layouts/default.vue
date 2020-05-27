<template lang="pug">
  v-app
    v-navigation-drawer(
      v-model="drawer"
      v-show="initialized"
      :mini-variant="miniVariant"
      :clipped="clipped"
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
    v-app-bar(:clipped-left="clipped"
      true
      app)
      v-app-bar-nav-icon(v-show="initialized" @click="drawer = !drawer")
      v-toolbar-title.pa-0(v-if="initialized")
        v-list-item.pl-0
          v-list-item-avatar.header-avatar(@click="goTo" width="50" height="auto" tile)
            v-img(contain :src="domain_icon" )
          v-list-item-content
            v-list-item-title.headline {{domain_title}}
    v-content
      v-container(v-if="initialized")
        nuxt
    GlobalSnackbar
    v-bottom-sheet(hide-overlay :value="privacy_sheet_open")
      div(style="background: white;height: 100%; width: 100%")
        div.pt-5.pl-5.pb-2
          h3.mb-3 Your Privacy
            v-container(style="margin: 0")
              v-row
                v-col(cols="12" lg="8")
                  div(style="font-size: 1.2rem") We do not use cookies nor do we include any 3rd party cookies. We only store the data that you directly provide in your public user profile or in the entries you create or contribute to. <a href="/about#privacy">Read our privacy policy for more information.</a>
                v-spacer
                v-col
                  v-btn(@click="privacy_sheet_open=false") Thank you
</template>


<script>
  import GlobalSnackbar from "~/components/global/GlobalSnackbar"
  import {ADMIN, HOME} from "~/lib/consts"
  import Footer from "~/components/global/Footer"

  import {initialize, reload_storage} from "~/lib/client"
  import {all_pages_n_actions} from "~/lib/pages";
  import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";

  import {mapGetters} from "vuex"
  import PersistentStorageMixin from "~/components/util/PersistentStorageMixin";
  import {DOMAIN, LOGOUT} from "~/store";
  import {USER_GLOBAL_ROLE, USER_LOGGED_IN} from "~/store/user";
  import {APP_CONNECTED, APP_CONNECTING, APP_DB_LOADED, APP_INITIALIZED,} from "~/store/app"
  import {dev_env} from "~/lib/util"


  let require_login = ["Profile", "Logout"]
  let hide_logged_in = ["Login", "Register"]
  let require_admin = ["Admin"]
  let hide_no_be = ["Register", "Login"] // if not connected out and if logged in out
  let show_inDev = ["Tests"] //, "Types", "Entrytypes", "Aspectbuild"]
  let lastDomain = ''
  const pkg = require('~/package')

  export default {
    components: {GlobalSnackbar, Footer},
    mixins: [TriggerSnackbarMixin, PersistentStorageMixin],
    data() {
      return {
        ci: "",
        version: pkg.version,
        isDev: this.$store.app.context.isDev,
        drawer: false,
        clipped: false,
        miniVariant: false,
        title: this.$store.getters[DOMAIN] ? this.$store.state.domain.title : HOME,
        privacy_shown: false,
        privacy_sheet_open: false
      }
    },
    created() {
      if (!this.db_loaded)
        reload_storage(this.$store, this.$localForage)
      if (!this.$api.is_initialized()) {
        this.$api.init(this.$axios) // , "https://opentek.eu"
        if (!dev_env()) {
          this.privacy_sheet_open = true
        }
      }
    },
    computed: {
      ...mapGetters([APP_CONNECTING, DOMAIN]),
      ...mapGetters({
        db_loaded: APP_DB_LOADED,
        logged_in: USER_LOGGED_IN,
        connected: APP_CONNECTED,
        initialized: APP_INITIALIZED,
      }),
      groups() {
        const home = all_pages_n_actions[0]
        let other_pages = this.$_.tail(all_pages_n_actions)
        if (this.connected) {
        } else {
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
      // db_loaded() {
      //   return this.$store.getters[APP_DB_LOADED]()
      // },
      // initialized() {
      //   const is_initialized = this.$store.getters[APP_INITIALIZED]()
      //   console.log("layout.default: calling init?", is_initialized)
      //   return is_initialized
      // },
      connected_icon() {
        if (this.connected) {
          return "wifi"
        } else {
          return "wifi_off"
        }
      },
      domain_title() {
        return this.domain ? this.domain.title : HOME
      },
      domain_icon() {
        // todo only use name, but set change it in no_domain
        return this.$api.static_url_$domain_name_icon(this.domain.name || this.domain.value)
      }
    },
    methods: {
      goTo() {
        let domain = this.$store.getters[DOMAIN]
        this.$router.push({
          path: "domain", query: {d: domain.name}
        })
      },
      action(action_type) {
        if (action_type === "logout") {
          this.$api.actor__logout().then(() => {
            this.ok_snackbar("You are logged out")
            this.clear_storage()
            debugger
            // todo, remove draft entries and update storage, to leave no traces...
            this.$store.dispatch(LOGOUT)
            this.drawer = false
            this.$router.push("/")
          }).catch((err) => {
            console.log("logout error", err)
            if (this.$_.get(err, "response.status") === 401) {
              this.ok_snackbar("You are logged out")
            }
            this.remove_from_storage("auth_token")
            this.$store.dispatch(LOGOUT)
            this.drawer = false
            this.$router.push("/")
          })
        }
      }
    },
    watch: {
      domain_title: function (newValue, oldValue) {
        if (newValue !== HOME) {
          lastDomain = newValue
        }
      },
      db_loaded(val) {
        // console.log("db loaded", this.initialized)
        if (val) {
          console.log("layout. initializing")
          initialize(this.$api, this.$store, this.$route, this.$router, this.$localForage)
        }
      }
    }
  }
</script>

<style>

  input {
    border-style: none !important
  }

  .v-text-field.v-text-field--enclosed {
    margin: 1%
  }

  .v-text-field--outline {
    margin: 1%
  }

  .wide_divider {
    margin-top: 1.6%;
    margin-bottom: 1.6%;
  }

  .disabled * {
    opacity: 0.8;
  }

  .header-subtitle {
    font-size: 0.6em
  }

  .header-avatar {
    cursor: pointer;
  }

  .package-version {
    color: rgb(109, 109, 109);
    font-size: 14px;
  }
</style>
