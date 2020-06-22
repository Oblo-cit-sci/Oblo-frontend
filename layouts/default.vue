<template lang="pug">
  v-app
    MenuContainer(:show="initialized" :menu_mode_fixed="true")
    Appbar
    v-content
      NotificationBanner
      v-container(v-if="initialized")
        nuxt
    GlobalSnackbar
    PrivacySheet(:privacy_sheet_open.sync="privacy_sheet_open")
</template>

<script>
  import GlobalSnackbar from "~/components/global/GlobalSnackbar"
  import Footer from "~/components/global/Footer"

  import {initialize, reload_storage} from "~/lib/client"
  import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";

  import {mapGetters} from "vuex"
  import PersistentStorageMixin from "~/components/util/PersistentStorageMixin";
  import {APP_CONNECTED, APP_CONNECTING, APP_DB_LOADED, APP_INITIALIZED,} from "~/store/app"
  import {dev_env} from "~/lib/util"
  import NavBaseMixin from "~/components/NavBaseMixin"
  import MainMenu from "~/components/menu/MainMenu"
  import PrivacySheet from "~/components/global/PrivacySheet"
  import Appbar from "~/components/global/Appbar"
  import InitializationMixin from "~/layouts/InitializationMixin"
  import MenuContainer from "~/components/menu/MenuContainer"
  import NotificationBanner from "~/components/global/NotificationBanner"
  import {USER} from "~/store"

  let lastDomain = ''

  export default {
    components: {NotificationBanner, MenuContainer, Appbar, PrivacySheet, MainMenu, GlobalSnackbar, Footer},
    mixins: [InitializationMixin, TriggerSnackbarMixin, PersistentStorageMixin, NavBaseMixin],
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
