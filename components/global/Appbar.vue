<template lang="pug">
  v-app-bar(true app elevation="2" )
    v-app-bar-nav-icon(:disabled="!show_nav_icon" v-show="initialized" @click="switch_menu_open" :style="nav_icon_style")
    v-toolbar-title.pa-0(v-if="initialized")
      v-list-item.pl-0
        v-list-item-avatar.header-avatar(@click="to_set_domain" width="50" height="auto" tile)
          v-img(contain :src="domain_icon")
        v-list-item-content
          v-list-item-title.headline
            span {{domain_title}}
            span.ml-5(v-if="this.$vuetify.breakpoint.smAndUp" :style="reduce_when_small") {{domain_headline}}
</template>

<script>
  import {APP_CONNECTED, APP_CONNECTING, APP_INITIALIZED} from "~/store/app"

  import {mapGetters, mapMutations} from "vuex"
  import {DOMAIN, DOMAIN_BY_NAME} from "~/store"
  import {HOME} from "~/lib/consts"
  import NavBaseMixin from "~/components/NavBaseMixin"

  export default {
    name: "Appbar",
    mixins: [NavBaseMixin],
    components: {},
    props: {
      show_nav_icon: {
        type: Boolean,
        default: true
      }
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
      nav_icon_style() {
        if (!this.show_nav_icon) {
          return {
            'visibility': "hidden"
          }
        }
      },
      reduce_when_small() {
        if (this.$vuetify.breakpoint.smAndDown) {
          return {"font-size": "80%"}
        } else {
          return {"font-size": "90%"}
        }
      },
      domain_title() {
        return this.domain ? this.domain.title : HOME
      },
      domain_icon() {
        // todo only use name, but set change it in no_domain
        return this.$api.static_url_$domain_name_icon(this.domain.name || this.domain.value)
      },
      domain_headline() {
        if (this.domain.name)
          return this.domain_data(this.domain.name).page_index.title
      }
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
