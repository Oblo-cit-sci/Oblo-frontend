<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      v-show="initialized"
      :mini-variant="miniVariant"
      :clipped="clipped"
      app
    >
      <v-list>
        <v-list-item-group v-for="group in groups" :key="group.name">
          <v-list-item v-for="item in group.items"
                       :key="item.to"
                       :to="item.to"
                       router
                       nuxt
                       @click="item.action ? action(item.action) : ''"
                       exact>
            <v-list-item-icon>
              <v-icon>{{item.icon}}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
        <v-list-item>
          <p class="package-version"> v{{version}} </p>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      true
      app
    >
      <v-app-bar-nav-icon v-show="initialized" @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="pa-0" v-if="initialized">
        <v-list-item class="pl-0">
          <v-list-item-avatar class="header-avatar" @click="goTo" :src="domain_icon" width="55" height="auto" tile>
            <v-img contain :src="domain_icon"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="headline">
              {{domain_title}}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-toolbar-title>
    </v-app-bar>
    <v-content>
      <v-container v-if="initialized">
        <nuxt/>
      </v-container>
    </v-content>
    <GlobalSnackbar></GlobalSnackbar>
  </v-app>
</template>


<script>
  import GlobalSnackbar from "~/components/GlobalSnackbar"
  import {HOME} from "~/lib/consts"
  import Footer from "~/components/Footer"

  import {initialize, reload_storage} from "~/lib/client"
  import {all_pages_n_actions} from "~/lib/pages";
  import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";

  import {mapGetters} from "vuex"
  import PersistentStorageMixin from "~/components/PersistentStorageMixin";
  import {DOMAIN} from "~/store";
  import {USER_LOGGED_IN, USER_LOGOUT} from "~/store/user";
  import {APP_CONNECTED, APP_CONNECTING, APP_DB_LOADED, APP_INITIALIZED} from "~/store/app"
  import {LOGOUT} from "~/store"


  let require_login = ["Profile", "Logout"]
  let hide_logged_in = ["Login", "Register"]
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
      }
    },
    created() {
      if (!this.db_loaded)
        reload_storage(this.$store, this.$localForage)
      if (!this.$api.is_initialized()) {
        this.$api.init(this.$axios) // , "https://opentek.eu"
      }
    },
    computed: {
      ...mapGetters([APP_CONNECTING, USER_LOGGED_IN, DOMAIN]),
      ...mapGetters({db_loaded: APP_DB_LOADED, logged_in: USER_LOGGED_IN, connected: APP_CONNECTED, initialized: APP_INITIALIZED}),
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
      userrole_icon() {
        if (this.$store.getters.visitor) {
          return "person_outline"
        } else {
          return "person"
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
        if (this.$route.path !== domain.to) {
          this.$router.push({
            path: domain.to ? domain.to : '/'
          })
        }
      },
      action(action_type) {
        if (action_type === "logout") {
          this.$api.actor__logout().then(() => {
            this.ok_snackbar("You are logged out")
            this.clear_storage()
            // todo, remove draft entries and update storage, to leave no traces...
            this.$store.dispatch(LOGOUT)
            this.drawer = false
            this.$router.push("/")
          }).catch((err) => {
            console.log("logout error", err.response)
            if (err.response.status === 401) {
              this.ok_snackbar("You are logged out")
              this.remove_from_storage("auth_token")
              this.$store.dispatch(USER_LOGOUT)
              this.drawer = false
              this.$router.push("/")
            }
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
