<template lang="pug">
  div
    v-navigation-drawer(
      :value="menu_open"
      :temporary="over"
      :hide-overlay="over"
      :stateless="over"
      :style="behind_style"
      :width="menu_width"
      app)
      div(v-if="over" :style="{'height':'60px'}")
      div(v-if="!menu_mode_fixed")
        v-tabs(v-model="menu_state" grow active-class="active_tab")
          v-tab {{$t("comp.menucontainer.tab_main")}}
          v-tab(@click="click") {{$t("comp.menucontainer.tab_domain")}}
        NotificationBanner
        v-tabs-items(v-model="menu_state")
          v-tab-item
            MainMenuList
          v-tab-item
            DomainMenu( @force_menu_mode="this.menu_state=1")
      MainMenuList(v-else)
</template>

<script>

  import {MENU_MODE_DOMAIN_OVERVIEW, MENU_MODE_MAIN} from "~/lib/consts"
  import MainMenuList from "~/components/menu/MainMenuList"
  import {mapGetters} from "vuex"
  import MapNavigationDrawer from "~/components/map/MapNavigationDrawer"
  import DomainMenu from "~/components/menu/DomainMenu"
  import NotificationBanner from "~/components/global/NotificationBanner"
  import HasMainNavComponentMixin from "~/components/global/HasMainNavComponentMixin"

  const mode_indices = [MENU_MODE_MAIN, MENU_MODE_DOMAIN_OVERVIEW]

  export default {
    name: "MenuContainer",
    mixins: [HasMainNavComponentMixin],
    components: {NotificationBanner, DomainMenu, MapNavigationDrawer, MainMenuList},
    props: {
      menu_mode_fixed: Boolean,
      over: Boolean,
    },
    created() {
      if (this.menu_mode_fixed) {
        this.menu_state = MENU_MODE_MAIN
      } else {
        this.menu_state = MENU_MODE_DOMAIN_OVERVIEW
      }
      this.$store.commit("menu/menu_width", this.menu_width)
    },
    computed: {
      ...mapGetters({
        menu_open: "menu/open",
      }),
      menu_state: {
        get() {
          return this.$store.getters["menu/menu_state"]
        },
        set(state) {
          this.$store.commit("menu/menu_state", state)
        }
      },
      behind_style() {
        if (this.over) {
          return {
            "z-index": 1
          }
        }
      },
      menu_width() {
        switch (this.menu_state) {
          case MENU_MODE_MAIN:
            return 256;
          case MENU_MODE_DOMAIN_OVERVIEW:
            switch (this.$vuetify.breakpoint.name) {
              case "xl":
                return 600
              case "lg":
                return 500
              case "md":
                return 400
              case "sm":
              case "xs":
                return "100%"
            }
        }
      }
    },
    methods: {
      click() {
        console.log("menu container change", this.domain_navigation_mode)
        this.unselect_entry()
      }
    },
    watch: {
      state() {
        this.$store.commit("menu/menu_width", this.menu_width)
      },
      menu_width() {
        this.$store.commit("menu/menu_width", this.menu_width)
      }
    }
  }
</script>

<style scoped>

  .active_tab {
    background: aliceblue;
  }
</style>
