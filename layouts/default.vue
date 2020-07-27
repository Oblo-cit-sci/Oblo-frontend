<template lang="pug">
  v-app
    MenuContainer(v-if="initialized" :menu_mode_fixed="!is_domain_page"
      :over="menu_over")
    Appbar(:show_nav_icon="show_nav_icon")
    v-main
      NotificationBanner
      v-container(v-if="initialized" :style="container_style")
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
    computed: {
      menu_over() {
        return this.is_domain_page
      },
      show_nav_icon() {
        return !this.is_domain_page || this.$vuetify.breakpoint.smallAndDown
      },
      container_style() {
        if (this.is_domain_page) {
          return {
            padding: 0,
            margin: 0
          }
        }
      }
    },
  }
</script>

<style>

</style>
