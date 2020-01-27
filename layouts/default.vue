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
      <v-spacer></v-spacer>
      <div v-if="logged_in">
        <v-btn v-for="(item, i) in header_items"
               :key="i"
               :to="item.to"
               icon
               router
               nuxt
               exact>
          <v-icon>{{ item.icon }}</v-icon>
        </v-btn>
      </div>

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
  import {
    INITIALIZED,
    DOMAIN,
    CONNECTING,
    CONNECTED,
    USER_LOGGED_IN, SEARCH_SET_ENTRIES, ENTRIES_ALL_ENTRIES_ARRAY, DB_LOADED
  } from "../lib/store_consts"
  import GlobalSnackbar from "../components/GlobalSnackbar"
  import {HOME} from "../lib/consts"
  import Footer from "../components/Footer"

  import {initialize, reload_storage} from "../lib/client"
  import {mapGetters} from "vuex"
  import {get_release_mode, static_file_path} from "../lib/util";
  import {all_pages} from "../lib/pages";


  const header_items = [
    /*{icon: "",to: "/export"},*/
    {icon: 'home', to: '/'},
    /*{icon: 'notifications',title: '',to: '/notifications'},*/
  ]

  let require_login = ["/profile", "/logout"]
  let hide_no_be = ["/register", "/login"] // if not connected out and if logged in out
  let show_inDev = ["Tests", "Types", "Entrytypes", "Aspectbuild"]
  let lastDomain = ''
  const pkg = require('../package')

  export default {
    components: {GlobalSnackbar, Footer},
    data() {
      return {
        ci: "",
        version: pkg.version,
        isDev: this.$store.app.context.isDev,
        drawer: false,
        clipped: false,
        miniVariant: false,
        title: this.$store.getters[DOMAIN] ? this.$store.state.domain.title : HOME,
        header_items: header_items
      }
    },
    created() {
      //console.log("layout created. initialized?", this.initialized)
      reload_storage(this.$store, this.$localForage)
    },
    computed: {
      /*
  ...mapGetters([INITIALIZED, CONNECTING, CONNECTED, USER_LOGGED_IN]),
logged_in() {
return this.user_logged_in
},
*/
      groups() {
        const home = all_pages[0]
        let other_pages = this.$_.tail(all_pages)
        other_pages = other_pages.filter(p => !hide_no_be.includes(p.to))
        if (!this.logged_in) {
          other_pages = other_pages.filter(p => !require_login.includes(p.to))
        }
        return [{name: "home", items: [home]},
          {name: "other", items: other_pages}]
      },
      db_loaded() {
        return this.$store.getters[DB_LOADED]()
      },
      initialized() {
        console.log("layout.default: calling init?", this.$store.getters[INITIALIZED]())
        return this.$store.getters[INITIALIZED]()
      },
      connecting() {
        return this.$store.getters[CONNECTING]
      },
      connected() {
        return this.$store.getters[CONNECTED]
      },
      logged_in() {
        return this.$store.getters[USER_LOGGED_IN]
      },
      // todo bring back this logic in computed.groups
      // items() {
      //   let items = all_pages
      //   if (!this.logged_in) {
      //     items = this.$_.filter(items, item => require_login.indexOf(item.title) === -1)
      //     if (!this.connected) {
      //       items = this.$_.filter(items, item => hide_no_login.indexOf(item.title) === -1)
      //     }
      //   } else { // logged in
      //     items = this.$_.filter(items, item => hide_no_login.indexOf(item.title) === -1)
      //   }
      //   if (!this.isDev) {
      //     items = this.$_.filter(items, item => show_inDev.indexOf(item.title) === -1)
      //   }
      //   return items
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
        let domain = this.$store.getters[DOMAIN]
        return domain ? domain.title : HOME
      },
      domain_icon() {
        let domain = this.$store.getters[DOMAIN]
        return domain ? static_file_path(this.$store, domain.icon) : undefined
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
      }
    },
    watch: {
      domain_title: function (newValue, oldValue) {
        if (newValue !== HOME && newValue !== lastDomain) {
          this.$store.commit(SEARCH_SET_ENTRIES, [])
        }
        if (newValue !== HOME) {
          lastDomain = newValue
        }
      },
      db_loaded(val, old) {
        console.log("db_loaded", val)
        console.log(this.$store.getters[ENTRIES_ALL_ENTRIES_ARRAY]())
        if (val && !this.initialized) {
          console.log("layout. initializing")
          initialize(this.$axios, this.$store, this.$localForage).then(() => {
            console.log("layout init done, promise done")
          })
          console.log("layout init done")
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
    margin-top: 2%;
    margin-bottom: 2%;
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
