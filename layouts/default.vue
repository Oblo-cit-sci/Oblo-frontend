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
      <v-spacer/>
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
      icon: 'person',
      title: 'Profile',
      to: '/profile'
    },
    {
      icon: 'note_add',
      title: 'Create Entry',
      to: '/CreateEntry'
    },
    {
      icon: 'list',
      title: 'Codes',
      to: '/Codes'
    },
    {
      icon: 'list',
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
      icon: 'list',
      title: 'Logout',
      to: '/logout'
    }
  ];


  let require_login = ["Profile", "Logout"];
  let hide_on_login = ["Register","Login"];

  export default {
    components: {GlobalSnackbar},
    computed: {
      login_state() {
        return this.$store.state.logged_in
      }
    },
    created() {
      this.update_sidebar();
    },
    watch: {
      login_state(newV, oldV){
        this.update_sidebar();
      }
    },
    methods: {
      update_sidebar() {
        // not logged in
        if (!this.login_state) {
          this.items = all_items.filter(item => require_login.indexOf(item.title) === -1);
        } else { // logged in
          this.items = all_items.filter(item => hide_on_login.indexOf(item.title) === -1);
        }
      },
      message() {
        console.log("some message");
      }
    },
    data() {
      return {
        drawer: false,
        clipped: false,
        miniVariant: false,
        title: 'LICCI',
        items: all_items
      }
    }
  }
</script>
