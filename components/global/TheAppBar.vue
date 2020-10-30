<template lang="pug">
  v-app-bar(true app elevation="2" :style="{'z-index':7}")
    v-app-bar-nav-icon.rounded-circle(color="blue"  v-show="initialized" @click="switch_menu")
      v-icon {{main_icon}}
    v-toolbar-title.pa-0(v-if="initialized")
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
      div(:style="display_debug") {{display_debug_text}} v{{version}}
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
import DomainLanguageMixin from "~/components/domain/DomainLanguageMixin"
import Dialog from "~/components/dialogs/Dialog"
import LoginComponent from "~/components/page_components/LoginComponent"
import HasMainNavComponentMixin, {ENTRY} from "~/components/global/HasMainNavComponentMixin"

const pkg = require('~/package.json')

export default {
  name: "TheAppBar",
  mixins: [NavBaseMixin, ResponsivenessMixin, URLQueryMixin, DomainLanguageMixin, HasMainNavComponentMixin],
  components: {LoginComponent, Dialog, CreateEntryButton},
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
    domain_title() {
      return this.$_.get(this.act_lang_domain_data, "title", "Offline")
    },
    domain_icon() {
      // todo only use name, but set change it in no_domain
      return this.$api.static_url_$domain_name_icon(this.act_domain_name)
    },
    domain_headline() {
      return this.$_.get(this.act_lang_domain_data, "long_title", "")
    },
    display_debug() {
      return {
        padding: "0 8px",
        "height": "20px",
        "position": "fixed",
        "right": "30px",
        "top": "10px",
        "font-size": "70%",
        "background-color": "grey",
        "text-align": "center",
        "z-index": 10000
      }
    },
    display_debug_text() {
      return this.$vuetify.breakpoint.name
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
        "right": "10%",
        "top": "5%"
      }
    },
    show_create_entry_button() {
      return this.is_domain_page && this.is_small && this.initialized
    },
    // domain_data() {
    //   return this.$store.getters["domain_data"](this.query_param_domain_name, this.$store.getters["user/settings"].ui_language)
    // },
    show_login_btn() {
      return this.smAndUp && !this.logged_in
    },
    //
    version() {
      console.log(process.env.NODE_ENV)
      return pkg.version
    }
  },
  methods: {
    ...mapMutations({switch_menu_open: 'menu/switch_open'}),
    switch_menu() {
      if(this.is_small && this.navigation_mode === ENTRY)  {
        this.unselect_entry()
      }
      this.switch_menu_open()
    },
    open_login() {
      this.login_dialog_open=true
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
