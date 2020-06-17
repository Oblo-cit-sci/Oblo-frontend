<template lang="pug">
  v-app
    v-content
      Appbar(:show_nav_icon="false")
      v-container(v-if="initialized" id="fullContainer")
        nuxt
</template>

<script>
  import {APP_CONNECTED, APP_DB_LOADED, APP_INITIALIZED} from "~/store/app"
  import {USER_LOGGED_IN} from "~/store/user"
  import {mapGetters} from "vuex"
  import Appbar from "~/components/global/Appbar"
  import InitializationMixin from "~/layouts/InitializationMixin"
  import {dev_env} from "~/lib/util"

  export default {
    name: "new_map_layout",
    mixins: [InitializationMixin],
    components: {Appbar},
    props: {},
    data() {
      return {}
    },
    created() {
      if (!dev_env()) {
        this.privacy_sheet_open = true
      }
    },
    computed: {
      ...mapGetters({
        db_loaded: APP_DB_LOADED,
        logged_in: USER_LOGGED_IN,
        connected: APP_CONNECTED,
        initialized: APP_INITIALIZED,
      })
    },
    methods: {}
  }
</script>

<style scoped>

  #fullContainer {
    max-width: 100%;
    padding: 0;
    height: 100%;
  }
</style>
