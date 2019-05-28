<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
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
      <v-toolbar-side-icon @click="drawer = !drawer"/>
      <v-toolbar-title v-text="title"/>
      <v-spacer></v-spacer>
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

  import GlobalSnackbar from "../components/GlobalSnackbar";

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
      icon: 'list',
      title: 'Register',
      to: '/register'
    },
    {
      icon: 'list',
      title: 'Login',
      to: '/login'
    },
    {
      icon: 'motorcycle',
      title: 'Logout',
      to: '/logout'
    }
  ];

  let require_login = ["Profile", "Logout", "My Entries"];
  let hide_on_login = ["Register", "Login"];

  export default {
    components: {GlobalSnackbar},
    created() {
      this.login_state = this.$store.state.user.logged_in;
      this.update_sidebar();
      this.$store.watch(state => state.user.logged_in, () => {
        this.login_state = this.$store.state.user.logged_in;
        this.update_sidebar();
      });
    },
    methods: {
      update_sidebar() {
        // not logged in
        if (!this.login_state) {
          this.items = all_items.filter(item => require_login.indexOf(item.title) === -1);
        } else { // logged in
          this.items = all_items.filter(item => hide_on_login.indexOf(item.title) === -1);
        }
      }
    },
    data() {
      return {
        login_state: false,
        drawer: false,
        clipped: false,
        miniVariant: false,
        title: 'LICCI',
        items: all_items,
        header_items: [
          {
            icon: 'home',
            to: '/'
          },
          {
            icon: 'notifications',
            title: '',
            to: '/notifications'
          },
        ]
      }
    }
  }
</script>

<style>

  input {
    border-style: none !important;
  }
</style>
