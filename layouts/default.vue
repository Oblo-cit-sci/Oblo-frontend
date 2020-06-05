<template lang="pug">
  v-app
    MainMenu(:show="initialized")
    Appbar
    v-content
      v-container(v-if="initialized")
        nuxt
    GlobalSnackbar
    PrivacySheet(:privacy_sheet_open.sync="privacy_sheet_open")
</template>

<script>
  import GlobalSnackbar from "~/components/global/GlobalSnackbar"
  import {HOME} from "~/lib/consts"
  import Footer from "~/components/global/Footer"

  import {initialize, reload_storage} from "~/lib/client"
  import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";

  import {mapGetters} from "vuex"
  import PersistentStorageMixin from "~/components/util/PersistentStorageMixin";
  import {USER_LOGGED_IN} from "~/store/user";
  import {APP_CONNECTED, APP_CONNECTING, APP_DB_LOADED, APP_INITIALIZED,} from "~/store/app"
  import {dev_env} from "~/lib/util"
  import NavBaseMixin from "~/components/NavBaseMixin"
  import MainMenu from "~/components/global/MainMenu"
  import PrivacySheet from "~/components/global/PrivacySheet"
  import Appbar from "~/components/global/Appbar"

  let lastDomain = ''


  export default {
    components: {Appbar, PrivacySheet, MainMenu, GlobalSnackbar, Footer},
    mixins: [TriggerSnackbarMixin, PersistentStorageMixin, NavBaseMixin],
    data() {
      return {
        isDev: this.$store.app.context.isDev,
        privacy_sheet_open: false
      }
    },
    created() {
      if (!this.db_loaded)
        reload_storage(this.$store, this.$localForage)
      if (!this.$api.is_initialized()) {
        this.$api.init(this.$axios) // , "https://opentek.eu"
        if (!dev_env()) {
          this.privacy_sheet_open = true
        }
      }
    },
    computed: {
      ...mapGetters([APP_CONNECTING]),
      ...mapGetters({
        db_loaded: APP_DB_LOADED,
        connected: APP_CONNECTED,
        initialized: APP_INITIALIZED
      }),
      connected_icon() {
        if (this.connected) {
          return "wifi"
        } else {
          return "wifi_off"
        }
      }
    },
    methods: {
    },
    watch: {
      db_loaded(val) {
        // console.log("db loaded", this.initialized)
        if (val) {
          // console.log("layout. initializing")
          initialize(this.$api, this.$store, this.$route, this.$router, this.$localForage)
        }
      }
    }
  }
</script>

<style>

  input {
    border-style: none !important
  }

  .v-text-field.v-text-field--enclosed {
    margin: 1%
  }

  .v-text-field--outline {
    margin: 1%
  }

  .wide_divider {
    margin-top: 1.6%;
    margin-bottom: 1.6%;
  }

  .disabled * {
    opacity: 0.8;
  }

  .header-subtitle {
    font-size: 0.6em
  }

  .header-avatar {
    cursor: pointer;
  }

  .package-version {
    color: rgb(109, 109, 109);
    font-size: 14px;
  }
</style>
