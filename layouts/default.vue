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
        {{title}}
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
      <div v-if="login_state">
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

    /*

    */

    import GlobalSnackbar from "../components/GlobalSnackbar"

    const all_items = [
        {
            icon: 'home',
            title: 'Home',
            to: '/'
        },
        {
            icon: 'note_add',
            title: 'Create Entry',
            to: '/CreateEntry'
        },
        {
            icon: "reorder",
            title: "My Entries",
            to: "/personalentries"
        },
        {
            icon: 'person',
            title: 'Profile',
            to: '/profile'
        },
        {
            icon: 'computer',
            title: 'Tests',
            to: '/Tests'
        },
        {
            icon: 'flip_to_front',
            title: 'Entrytypes',
            to: '/CreateEntrytype'
        },
        {
            icon: 'fa-map',
            title: 'Map',
            to: '/Map'
        },
        {
            icon: 'computer',
            title: 'Aspectbuild',
            to: '/AspectBuild'
        },
        {
            icon: 'how_to_reg',
            title: 'Register',
            to: '/register'
        },
        {
            icon: 'play_arrow',
            title: 'Login',
            to: '/login'
        },
        {
            icon: 'keyboard_return',
            title: 'Logout',
            to: '/logout'
        },
        {
            icon: 'settings',
            title: 'Settings',
            to: '/settings'
        }
        /*{
          icon: "build",
          title: "debug",
          to: "/StoreDebug"
        }*/
    ]

    let require_login = ["Profile", "Logout"]
    let hide_no_login = ["Register", "Login"] // if not connected out and if logged in out
    let show_inDev = ["Tests", "Types", "Entrytypes", "Aspectbuild"]

    const pkg = require('../package')

    export default {
        components: {GlobalSnackbar},
        created() {

            this.login_state = this.$store.state.user.logged_in
            this.update_sidebar()

            this.$store.watch(state => state.connecting, () => {
                this.connecting = this.$store.state.connecting
            })

            this.$store.watch(state => state.user.logged_in, () => {
                this.login_state = this.$store.state.user.logged_in
                this.update_sidebar()
            })

            this.connected = this.$store.state.connected
            this.$store.watch(state => state.connected, () => {
                this.connected = this.$store.state.connected
                this.update_sidebar()
            })

            this.initialized = this.$store.state.initialized
            this.$store.watch(state => state.initialized, () => {
                this.initialized = this.$store.state.initialized
                this.update_sidebar()
            })
        },
        methods: {
            update_sidebar() {
                if (!this.login_state) {
                    this.items = all_items.filter(item => require_login.indexOf(item.title) === -1)
                    if (!this.connected) {
                        this.items = this.items.filter(item => hide_no_login.indexOf(item.title) === -1)
                    }
                } else { // logged in
                    this.items = all_items.filter(item => hide_no_login.indexOf(item.title) === -1)
                }
                if (!this.isDev) {
                    this.items = this.items.filter(item => show_inDev.indexOf(item.title) === -1)
                }
            }
        },
        data() {
            return {
                isDev: this.$store.app.context.isDev,
                login_state: false,
                connecting: false,
                connected: false,
                initialized: false,
                drawer: false,
                clipped: false,
                miniVariant: false,
                title: 'LICCI',
                version: pkg.version,
                items: all_items,
                header_items: [
                    /*{
                      icon: "",
                      to: "/export"
                    },*/
                    {
                        icon: 'home',
                        to: '/'
                    },
                    /*{
                      icon: 'notifications',
                      title: '',
                      to: '/notifications'
                    },*/
                ]
            }
        },
        computed: {
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
</style>
