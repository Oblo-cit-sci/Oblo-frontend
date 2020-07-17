<template lang="pug">
  v-app
    Appbar(:show_nav_icon="false")
    v-main
      v-container(v-if="initialized" id="fullContainer")
        nuxt
    PrivacySheet(:privacy_sheet_open.sync="privacy_sheet_open")
</template>

<script>
  import {APP_CONNECTED, APP_DB_LOADED, APP_INITIALIZED} from "~/store/app"
  import {USER_LOGGED_IN} from "~/store/user"
  import {mapGetters} from "vuex"
  import Appbar from "~/components/global/Appbar"
  import InitializationMixin from "~/layouts/InitializationMixin"
  import NotificationBanner from "~/components/global/NotificationBanner"
  import GlobalSnackbar from "~/components/global/GlobalSnackbar"
  import PrivacySheet from "~/components/global/PrivacySheet"
  import NavBaseMixin from "~/components/NavBaseMixin"

  export default {
    name: "new_map_layout",
    mixins: [InitializationMixin, NavBaseMixin],
    components: {PrivacySheet, GlobalSnackbar, NotificationBanner, Appbar},
    props: {},
    computed: {
      ...mapGetters({
        db_loaded: APP_DB_LOADED,
        logged_in: USER_LOGGED_IN,
        connected: APP_CONNECTED,
        initialized: APP_INITIALIZED,
      })
    }
  }
</script>

<style scoped>

  #fullContainer {
    max-width: 100%;
    padding: 0;
    height: 100%;
  }
</style>
