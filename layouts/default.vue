<template>
  <v-app>
    <v-navigation-drawer
      app
      v-model="drawer"
      v-show="initialized"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
    >
      <v-list>
        <v-list-item-group>
          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            :to="item.to"
            router
            nuxt
            exact
          >
            <v-list-item-icon>
              <v-icon v-text="item.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      true
      app
      dense
    >
      <v-app-bar-nav-icon v-show="initialized" @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>
      <span>
        {{domain_title}}
      </span>
        <span style="font-size: 0.6em">(v{{version}})</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <div>
        <v-btn text icon :loading="connecting">
          <!-- nuxt to="/" -->
          <v-icon>{{connected_icon}}</v-icon>
        </v-btn>
        <v-btn text icon>
          <!-- nuxt to="/profile" -->
          <v-icon>{{userrole_icon}}</v-icon>
        </v-btn>
      </div>
      <v-spacer></v-spacer>
      <div v-if="logged_in">
        <v-btn v-for="(item, i) in header_items"
               :key="i"
               :to="item.to"
               text
               icon
               router
               nuxt
               exact>
          <v-icon>{{ item.icon }}</v-icon>
        </v-btn>
      </div>
    </v-app-bar>
    <v-content>
      <v-container>
        <nuxt/>
      </v-container>
    </v-content>
    <GlobalSnackbar></GlobalSnackbar>
  </v-app>
</template>


<script>
    import {INITIALIZED, SET_ENTRIES, DOMAIN_TITLE, DOMAIN} from "../lib/store_consts"
    import GlobalSnackbar from "../components/GlobalSnackbar"
    import {HOME} from "../lib/consts"
    const all_items = [
        {icon: 'home', title: 'Home', to: '/'},
        {icon: 'note_add', title: 'Create Entry', to: '/CreateEntry'},
        {icon: "reorder", title: "My Entries", to: "/personalentries"},
        {icon: 'person', title: 'Profile', to: '/profile'},
        {icon: 'computer', title: 'Tests', to: '/Tests'},
        {icon: 'flip_to_front', title: 'Entrytypes', to: '/CreateEntrytype'},
        {icon: 'fa-map', title: 'Map', to: '/Map'},
        {icon: 'computer', title: 'Aspectbuild', to: '/AspectBuild'},
        {icon: 'how_to_reg', title: 'Register', to: '/register'},
        {icon: 'play_arrow', title: 'Login', to: '/login'},
        {icon: 'keyboard_return', title: 'Logout', to: '/logout'},
        {icon: 'settings', title: 'Settings', to: '/settings'}
        /*{icon: "build",title: "debug", to: "/StoreDebug"}*/
    ]

    const header_items = [
        /*{icon: "",to: "/export"},*/
        {icon: 'home', to: '/'},
        /*{icon: 'notifications',title: '',to: '/notifications'},*/
    ]

    let require_login = ["Profile", "Logout"]
    let hide_no_login = ["Register", "Login"] // if not connected out and if logged in out
    let show_inDev = ["Tests", "Types", "Entrytypes", "Aspectbuild"]
    let lastDomain = ''
    const pkg = require('../package')

    export default {
        components: {GlobalSnackbar},
        data() {
            return {
                isDev: this.$store.app.context.isDev,
                drawer: false,
                clipped: false,
                miniVariant: false,
                title: this.$store.getters[DOMAIN] ? this.$store.state.domain.title : HOME,
                version: pkg.version,
                header_items: header_items
            }
        },
        methods: {
            
        },
        computed: {
            initialized() {
              return this.$store.getters[INITIALIZED]
            },
            connecting() {
              return this.$store.getters["connecting"]
            },
            connected() {
              return this.$store.getters["connected"]
            },
            logged_in() {
              return this.$store.getters["user/logged_in"]
            },
            items() {
              let items = all_items
              if (!this.logged_in) {
                  items = this.$_.filter(items, item => require_login.indexOf(item.title) === -1)
                  if (!this.connected) {
                      items = this.$_.filter(items, item => hide_no_login.indexOf(item.title) === -1)
                  }
              } else { // logged in
                  items = this.$_.filter(items, item => hide_no_login.indexOf(item.title) === -1)
              }
              if (!this.isDev) {
                  items = this.$_.filter(items, item => show_inDev.indexOf(item.title) === -1)
              }
              return items
            },
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
              return this.$store.state.domain ? domain.title : HOME
            }
        },
        watch: {
          domain_title: function(newValue, oldValue) {
            if (newValue !== HOME && newValue !== lastDomain) {
              this.$store.commit(SET_ENTRIES, [])
            } 
            if(newValue !== HOME) {
              lastDomain = newValue
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

  .header-avatar {
  
  }

</style>
