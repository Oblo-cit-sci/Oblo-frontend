<template lang="pug">
  v-app
    MenuContainer(:show="initialized" :menu_mode_fixed="true")
    Appbar
    v-main
      NotificationBanner
      v-container(v-if="initialized")
        nuxt
    GlobalSnackbar
    PrivacySheet
</template>

<script>
  import GlobalSnackbar from "~/components/global/GlobalSnackbar"
  import PersistentStorageMixin from "~/components/util/PersistentStorageMixin";
  import NavBaseMixin from "~/components/NavBaseMixin"
  import PrivacySheet from "~/components/global/PrivacySheet"
  import Appbar from "~/components/global/Appbar"
  import InitializationMixin from "~/layouts/InitializationMixin"
  import MenuContainer from "~/components/menu/MenuContainer"
  import NotificationBanner from "~/components/global/NotificationBanner"

  export default {
    components: {NotificationBanner, MenuContainer, Appbar, PrivacySheet, GlobalSnackbar},
    mixins: [InitializationMixin, NavBaseMixin],
  }
</script>

<style>
</style>
