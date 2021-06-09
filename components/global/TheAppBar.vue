<template lang="pug">
  v-app-bar(true app elevation="2" :style="{'z-index':7}")
    v-app-bar-nav-icon.rounded-circle(color="blue"  v-show="initialized" @click="switch_menu")
      v-icon {{main_icon}}
    v-toolbar-title.pa-0(:style="{width:'100%'}" v-if="initialized")
      v-list-item.pl-0
        v-list-item-avatar.header-avatar(@click="to_set_domain" width="50" height="auto" tile)
          v-img(contain :src="domain_icon")
        v-list-item-content
          v-list-item-title.headline
            span {{domain_title}}
            span.ml-5(v-if="is_mdAndUp" :style="reduce_when_small") {{domain_headline}}
        v-list-item-action.ml-8(v-if="show_login_btn")
          v-btn(text large outlined rounded :style="{background:'white'}" @click="open_login")
            v-icon(left) mdi-login
            span {{$t('w.login')}}
    v-spacer
    LanguageSelector(v-if="show_language_selector")
    CreateEntryButton(v-if="show_create_entry_button" :style="create_button_style" :domain_data="act_lang_domain_data")
    Dialog(:dialog_open.sync="login_dialog_open")
      LoginComponent(:go_home="false" @logged_in="login_dialog_open=false" @page_change="login_dialog_open=false")
</template>

<script>

import {mapGetters, mapMutations} from "vuex"
import NavBaseMixin from "~/components/NavBaseMixin"
import CreateEntryButton from "~/components/CreateEntryButton";
import ResponsivenessMixin from "~/components/ResponsivenessMixin";
import URLQueryMixin from "~/components/util/URLQueryMixin";
import Dialog from "~/components/dialogs/Dialog"
import LoginComponent from "~/components/page_components/LoginComponent"
import HasMainNavComponentMixin, {ENTRY} from "~/components/global/HasMainNavComponentMixin"
import {NO_DOMAIN, VIEW} from "~/lib/consts"
import EnvMixin from "~/components/global/EnvMixin"
import {PAGE_INDEX, PAGE_LOGIN} from "~/lib/pages";
import OfflineMixin from "~/lib/OfflineMixin"
import LanguageSelector from "~/components/LanguageSelector"

const pkg = require('~/package.json')

export default {
  name: "TheAppBar",
  mixins: [NavBaseMixin, ResponsivenessMixin, URLQueryMixin, HasMainNavComponentMixin, EnvMixin, OfflineMixin],
  components: {LanguageSelector, LoginComponent, Dialog, CreateEntryButton},
  data() {
    return {
      login_dialog_open: false
    }
  },
  computed: {
    ...mapGetters({
      logged_in: "user/logged_in",
      connected: "app/connected",
      initialized: "app/initialized",
      act_domain_name: "domain/act_domain_name",
      act_lang_domain_data: "domain/act_lang_domain_data"
    }),
    reduce_when_small() {
      if (this.$vuetify.breakpoint.smAndDown) {
        return {"font-size": "80%"}
      } else {
        return {"font-size": "90%"}
      }
    },
    show_language_selector() {
      return this.is_large
    },
    // domain_data() {
    //   return this.cur_act_lang_domain_data()
    // },
    domain_title() {
      const platform_title = this.$store.getters["app/platform_data"].title || ""
      if (this.$route.name === "offline" && !this.is_offline) {
        return platform_title
      }
      if (this.is_offline) {
        return platform_title + " / " + this.$t("page.settings.asp.offline.label")
      }
      if (this.$store.getters["domain/act_domain_name"] === NO_DOMAIN) {
        return platform_title
      }
      if (this.act_lang_domain_data){
        return this.act_lang_domain_data.title
      }
      return ""
    },
    domain_icon() {
      if (this.is_offline || this.$route.name === "offline")
        return this.$api.static.domain_icon(NO_DOMAIN)
      else
        return this.$api.static.domain_icon(this.act_domain_name)
    },
    domain_headline() {
      if (!this.is_offline && this.$route.name !== "offline")
        return this.$_.get(this.act_lang_domain_data, "long_title", "")
    },
    main_icon() {
      if (this.is_domain_page && this.is_small) {
        if (this.$store.getters["menu/open"]) {
          return "mdi-map-outline"
        } else {
          return "mdi-menu"
        }
      } else {
        return "mdi-menu"
      }
    },
    // for the entry-create button
    create_button_style() {
      return {
        "position": "fixed",
        "right": this.show_login_btn ? "40%": "1%",
        "top": "5%"
      }
    },
    show_create_entry_button() {
      return this.is_domain_page && this.is_small && this.initialized
    },
    show_login_btn() {
      return this.smAndUp && !this.logged_in && ![PAGE_INDEX, PAGE_LOGIN].includes(this.$route.name) && !this.is_offline
    },
    //
    version() {
      // console.log(process.env.NODE_ENV)
      return pkg.version
    }
  },
  methods: {
    ...mapMutations({switch_menu_open: 'menu/switch_open'}),
    switch_menu() {
      if (this.is_small && this.navigation_mode === ENTRY) {
        if (this.entry_mode === VIEW) {
          this.unselect_entry()
        }
      }
      this.switch_menu_open()
    },
    open_login() {
      this.login_dialog_open = true
      // console.log(this.$refs.login_dialog)
      // this.$bus.$emit("global_dialog", this.$refs.login_dialog)
    }
  },
}
</script>

<style scoped>

.header-avatar {
  cursor: pointer;
}

</style>
