<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      v-show="initialized"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-tile
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          nuxt
          exact
        >
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"/>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar
      :clipped-left="clipped"
      true
      app
    >
      <v-toolbar-side-icon v-show="initialized" @click="drawer = !drawer"/>
      <v-btn v-show="!initialized" flat icon color="red" nuxt router exact to="/">
        <v-icon>{{connected_icon}}</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title"/>
      <v-spacer></v-spacer>
      <div>
        <v-btn flat icon nuxt router exact to="/export">
          <v-badge bottom color="rgba(0,255,0,0.9)">
            <!--<template v-slot:badge>
              <span>!</span>
            </template>-->
            <v-icon>get_app</v-icon>
          </v-badge>
        </v-btn>
      </div>
      <div v-if="login_state">
        <v-btn v-for="(item, i) in header_items"
               :key="i"
               :to="item.to"
               flat
               icon
               router
               nuxt
               exact>
          <v-icon>{{ item.icon }}</v-icon>
        </v-btn>
      </div>
    </v-toolbar>
    <v-content>
      <v-container>
        <nuxt/>
      </v-container>
    </v-content>
    <GlobalSnackbar></GlobalSnackbar>
  </v-app>
</template>

<script>

  import GlobalSnackbar from "../components/GlobalSnackbar"

  let all_items = [
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
      to: "personalentries"
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
      icon: 'computer',
      title: 'Types',
      to: '/etype'
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
    /*{
      icon: "build",
      title: "debug",
      to: "/StoreDebug"
    }*/
  ]

  let require_login = ["Profile", "Logout"]
  let hide_no_login = ["Register", "Login"] // if not connected out and if logged in out

  export default {
    components: {GlobalSnackbar},
    created() {
      this.login_state = this.$store.state.user.logged_in
      this.update_sidebar()

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
        this.connected = this.$store.state.initialized
        this.update_sidebar()
      })
    },
    methods: {
      update_sidebar() {
        // not logged in
        console.log("layout", !this.login_state)
        if (!this.login_state) {
          this.items = all_items.filter(item => require_login.indexOf(item.title) === -1)
          console.log("items", this.items)
          if (!this.connected) {
            this.items = this.items.filter(item => hide_no_login.indexOf(item.title) === -1)
          }
        } else { // logged in
          this.items = all_items.filter(item => hide_no_login.indexOf(item.title) === -1)
        }
      }
    },
    data() {
      return {
        login_state: false,
        connected: false,
        initialized: false,
        drawer: false,
        clipped: false,
        miniVariant: false,
        title: 'LICCI',
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
</style>
