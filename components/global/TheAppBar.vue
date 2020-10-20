<template lang="pug">
  v-app-bar(true app elevation="2" :style="{'z-index':7}")
    v-app-bar-nav-icon.rounded-circle(color="blue"  v-show="initialized" @click="switch_menu_open")
      v-icon {{main_icon}}
    v-toolbar-title.pa-0(v-if="initialized")
      v-list-item.pl-0
        v-list-item-avatar.header-avatar(@click="to_set_domain" width="50" height="auto" tile)
          v-img(contain :src="domain_icon")
        v-list-item-content
          v-list-item-title.headline
            span {{domain_title}}
            span.ml-5(v-if="is_mdAndUp" :style="reduce_when_small") {{domain_headline}}
      div(:style="display_debug") {{display_debug_text}}
      CreateEntryButton(v-if="show_create_entry_button" :style="create_button_style" :domain_data="domain_data" @create_entry="$emit('create_entry')")
</template>

<script>
import {APP_CONNECTED, APP_CONNECTING, APP_INITIALIZED} from "~/store/app"

import {mapGetters, mapMutations} from "vuex"
import {DOMAIN, DOMAIN_BY_NAME} from "~/store"
import {HOME} from "~/lib/consts"
import NavBaseMixin from "~/components/NavBaseMixin"
import CreateEntryButton from "~/components/CreateEntryButton";
import ResponsivenessMixin from "~/components/ResponsivenessMixin";
import URLQueryMixin from "~/components/util/URLQueryMixin";
import DomainLanguageMixin from "~/components/domain/DomainLanguageMixin"

// z-index to be above the loading overlay

export default {
  name: "TheAppBar",
  mixins: [NavBaseMixin, ResponsivenessMixin, URLQueryMixin, DomainLanguageMixin],
  components: {CreateEntryButton},
  props: {
  },
  data() {
    return {
      title: this.$store.getters[DOMAIN] ? this.$store.state.domain.title : HOME,
    }
  },
  computed: {
    ...mapGetters([DOMAIN]),
    ...mapGetters({
      connected: APP_CONNECTED,
      initialized: APP_INITIALIZED,
      domain_data: DOMAIN_BY_NAME,
    }),
    reduce_when_small() {
      if (this.$vuetify.breakpoint.smAndDown) {
        return {"font-size": "80%"}
      } else {
        return {"font-size": "90%"}
      }
    },
    domain_title() {
      return this.$_.get(this.ui_lang_domain_data(this.domain.name), "title", "Offline")
    },
    domain_icon() {
      // todo only use name, but set change it in no_domain
      return this.$api.static_url_$domain_name_icon(this.domain.name)
    },
    domain_headline() {
      return this.$_.get(this.ui_lang_domain_data(this.domain.name), "long_title", "")
    },
    display_debug() {
      return {
        "width": "40px",
        "height": "30px",
        "position": "fixed",
        "right": "20px",
        "top": "10px",
        "background-color": "grey",
        "text-align": "center",
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
    domain_data() {
      return this.$store.getters["domain_data"](this.query_param_domain_name, this.$store.getters["user/settings"].ui_language)
    }
    //
  },
  methods: {
    ...mapMutations({switch_menu_open: 'menu/switch_open'}),
  }
}
</script>

<style scoped>

.header-avatar {
  cursor: pointer;
}

</style>
