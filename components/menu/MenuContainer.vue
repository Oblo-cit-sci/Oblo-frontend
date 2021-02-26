<template lang="pug">
  div#menu_container
    v-navigation-drawer(
      v-model="menu_open"
      :right="is_rtl"
      :temporary="over"
      :hide-overlay="over"
      :stateless="over"
      :style="behind_style"
      :width="menu_width"
      app)
      .scrollable#menu_head(v-if="!menu_mode_fixed" :style="pad_if_over")
        v-tabs(v-model="menu_state" grow active-class="active_tab")
          v-tab {{$t("comp.menucontainer.tab_main")}}
          v-tab {{$t("comp.menucontainer.tab_domain")}}
        NotificationBanner
        v-tabs-items(v-model="menu_state" touchless)
          v-tab-item
            MainMenuList
          v-tab-item
            DomainMenu(@force_menu_mode="this.menu_state=1" :domain_data="domain_data")
        #bottom_fixer(v-if="mobile && has_touch")
      MainMenuList.scrollable(v-else)
</template>

<script>

import {MENU_MODE_DOMAIN, MENU_MODE_MAIN} from "~/lib/consts"
import MainMenuList from "~/components/menu/MainMenuList"
import DomainMenu from "~/components/menu/DomainMenu"
import NotificationBanner from "~/components/global/NotificationBanner"
import HasMainNavComponentMixin from "~/components/global/HasMainNavComponentMixin"
import ResponsivenessMixin from "~/components/ResponsivenessMixin";
import URLQueryMixin from "~/components/util/URLQueryMixin";

const mode_indices = [MENU_MODE_MAIN, MENU_MODE_DOMAIN]

export default {
  name: "MenuContainer",
  mixins: [HasMainNavComponentMixin, ResponsivenessMixin, URLQueryMixin],
  components: {NotificationBanner, DomainMenu, MainMenuList},
  props: {
    menu_mode_fixed: Boolean,
    over: Boolean,
  },
  created() {
    if (this.menu_mode_fixed) {
      this.menu_state = MENU_MODE_MAIN
    } else {
      this.menu_state = MENU_MODE_DOMAIN
    }
    this.$store.commit("menu/menu_width", this.menu_width)
  },
  computed: {
    domain_data() {
      const language = this.$store.getters["user/settings"].domain_language
      return this.$store.getters["domain/lang_domain_data"](this.query_param_domain_name, language)
    },
    pad_if_over() {
      return {
        "padding-top": this.over ? (this.is_small ? "56px" : "64px") : 0
      }
    },
    menu_open: {
      get() {
        return this.$store.getters["menu/open"]
      },
      set(open) {
        this.$store.commit("menu/open", open)
      }
    },
    menu_state: {
      get() {
        return this.$store.getters["menu/menu_state"]
      },
      set(state) {
        this.$store.commit("menu/menu_state", state)
      }
    },
    behind_style() {
      return {
        "z-index": this.over ? 6 : 8,
        "margin-bottom": "70px"
      }
    },
    menu_width() {
      if (this.is_small) {
        return "100%"
      }
      switch (this.menu_state) {
        case MENU_MODE_MAIN:
          return 300;
        case MENU_MODE_DOMAIN:
          switch (this.$vuetify.breakpoint.name) {
            case "xl":
              return 600
            case "lg":
              return 520
            case "md":
              return 450
          }
      }
    }
  },
  methods: {},
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

.scrollable {
  max-height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
}

#bottom_fixer {
  min-height: 50px;
}
</style>
