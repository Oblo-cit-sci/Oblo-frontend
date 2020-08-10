<template lang="pug">
  v-app
    MenuContainer(v-if="initialized" :menu_mode_fixed="!is_domain_page"
      :over="menu_over")
    TheAppBar(:show_nav_icon="show_nav_icon")
    v-main
      NotificationBanner(v-if="!is_domain_page")
      v-container(v-if="initialized" :style="container_style")
        nuxt
    TheSnackbar
    ThePrivacySheet
    <!--    v-fab-transition-->
    <!--      v-btn.help_button(float large fab color="info")-->
    <!--        v-icon mdi-help-->
</template>

<script>
  import TheSnackbar from "~/components/global/TheSnackbar"
  import NavBaseMixin from "~/components/NavBaseMixin"
  import ThePrivacySheet from "~/components/global/ThePrivacySheet"
  import TheAppBar from "~/components/global/TheAppBar"
  import InitializationMixin from "~/layouts/InitializationMixin"
  import MenuContainer from "~/components/menu/MenuContainer"
  import NotificationBanner from "~/components/global/NotificationBanner"

  export default {
    components: {NotificationBanner, MenuContainer, TheAppBar, ThePrivacySheet, TheSnackbar},
    mixins: [InitializationMixin, NavBaseMixin],
    computed: {
      menu_over() {
        return this.is_domain_page
      },
      show_nav_icon() {
        return !this.is_domain_page || this.$vuetify.breakpoint.smAndDown
      },
      container_style() {
        if (this.is_domain_page) {
          return {
            padding: 0,
            margin: 0
          }
        }
      },
    },
  }
</script>

<style>
  .help_button {
    position: fixed;
    bottom:40px;
    left: 3%;
    z-index:1000;
  }
</style>
