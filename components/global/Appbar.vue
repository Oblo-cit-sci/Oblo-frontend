<template lang="pug">
  v-app-bar(true app elevation="2" )
    v-app-bar-nav-icon(v-show="initialized" @click="switch_nav_drawer()")
    v-toolbar-title.pa-0(v-if="initialized")
      v-list-item.pl-0
        v-list-item-avatar.header-avatar(@click="to_set_domain" width="50" height="auto" tile)
          v-img(contain :src="domain_icon" )
        v-list-item-content
          v-list-item-title.headline {{domain_title}}
</template>

<script>
  import {APP_CONNECTED, APP_CONNECTING, APP_INITIALIZED} from "~/store/app"

  import {mapGetters, mapMutations} from "vuex"
  import {DOMAIN} from "~/store"
  import {HOME} from "~/lib/consts"
  import NavBaseMixin from "~/components/NavBaseMixin"

  export default {
    name: "Appbar",
    mixins: [NavBaseMixin],
    components: {},
    props: {},
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
      }),
      domain_title() {
        return this.domain ? this.domain.title : HOME
      },
      domain_icon() {
        // todo only use name, but set change it in no_domain
        return this.$api.static_url_$domain_name_icon(this.domain.name || this.domain.value)
      }
    },
    methods: {
      ...mapMutations({switch_nav_drawer: 'app/nav_drawer'}),
    }
  }
</script>

<style scoped>

</style>
