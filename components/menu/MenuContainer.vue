<template lang="pug">
  div
    v-navigation-drawer(
      v-model="drawer_state"
      :temporary="over"
      :hide-overlay="over"
      :stateless="over"
      bottom
      :style="behind_style"
      :width="menu_width"
      app)
      div(v-if="over" :style="{'height':'60px'}")
      div(v-if="!menu_mode_fixed")
        v-tabs(:value="mode" @change="$emit('update:mode', $event)" grow active-class="active_tab")
          v-tab main
          v-tab domain
        v-tabs-items(v-model="mode")
          v-tab-item
            MainMenuList
          v-tab-item
            DomainMenu(:navigation_mode="domain_navigation_mode" @force_menu_mode="this.mode=1")
      MainMenuList(v-if="menu_mode_fixed")
</template>

<script>

  import MainMenu from "~/components/menu/MainMenu"
  import {MENU_MODE_DOMAIN_OVERVIEW, MENU_MODE_MAIN} from "~/lib/consts"
  import MainMenuList from "~/components/menu/MainMenuList"
  import {mapGetters} from "vuex"
  import MapNavigationDrawer from "~/components/map/MapNavigationDrawer"
  import DomainMenu from "~/components/menu/DomainMenu"

  const mode_indices = [MENU_MODE_MAIN, MENU_MODE_DOMAIN_OVERVIEW]

  export default {
    name: "MenuContainer",
    mixins: [],
    components: {DomainMenu, MapNavigationDrawer, MainMenuList, MainMenu},
    props: {
      mode: {
        type: Number,
        default: MENU_MODE_MAIN
      },
      menu_mode_fixed: Boolean,
      over: Boolean,
      domain_navigation_mode: String
    },
    data() {
      return {}
    },
    created() {
      this.$emit("menu_width", this.menu_width)
    },
    computed: {
      ...mapGetters({
        nav_drawer: "app/nav_drawer"
      }),
      behind_style() {
        if (this.over) {
          return {
            "z-index": 1
          }
        }
      },
      drawer_state: {
        get: function () {
          return this.nav_drawer
        },
        set(nav_state) {
          this.$store.commit("app/nav_drawer", nav_state)
        }
      },
      menu_width() {
        switch (this.mode) {
          case MENU_MODE_MAIN:
            return 256;
          case MENU_MODE_DOMAIN_OVERVIEW:
            return this.$vuetify.breakpoint.xl ? 750 : 600
        }
      }
    },
    methods: {},
    watch: {
      mode(mode) {
        this.$emit("menu_width", this.menu_width)
      }
    }
  }
</script>

<style scoped>

  .active_tab {
    background: aliceblue;
  }
</style>
