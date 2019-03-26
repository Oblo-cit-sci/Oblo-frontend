<template>
  <v-app dark>
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
    <v-footer
      :fixed=true
      app
    >
    </v-footer>
  </v-app>
</template>

<script>
  export default {
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
        if (!this.login_state) {
          this.items.push(this.extra_items.login);
          this.items.push(this.extra_items.register);
        } else {
          this.items.splice(5,2);
          this.items.push(this.extra_items.logout);
        }
      }
    },
    data() {
      return {
        drawer: false,
        clipped: false,
        miniVariant: false,
        title: 'LICCI',
        extra_items: {
          "login": {
            icon: 'list',
            title: 'Login',
            to: '/login'
          },
          "register": {
            icon: 'list',
            title: 'Register',
            to: '/register'
          },
          "logout": {
            icon: 'list',
            title: 'Logout',
            to: '/logout'
          }
        },
        items: [
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
          }
        ]
      }
    }
  }
</script>
