<template lang="pug">
  v-app
    MenuContainer(v-if="initialized" :menu_mode_fixed="!is_domain_page"
      :over="menu_over")
    TheAppBar
    v-main(v-if="initialized")
      NotificationBanner(v-if="!is_domain_page")
      div(v-if="is_domain_page")
        nuxt
      v-container(v-else :style="container_style")
        TheOverlay
        nuxt
    TheSnackbar
    ThePrivacySheet
    DecisionDialog
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
import DecisionDialog from "~/components/util/DecisionDialog"
import TheOverlay from "~/components/global/TheOverlay";
import OfflineMixin from "~/lib/OfflineMixin"
import HomePathMixin from "~/components/menu/HomePathMixin"

export default {
  components: {TheOverlay, DecisionDialog, NotificationBanner, MenuContainer, TheAppBar, ThePrivacySheet, TheSnackbar},
  mixins: [InitializationMixin, NavBaseMixin, OfflineMixin, HomePathMixin],
  data() {
    return {
      global_dialog_comp: null
    }
  },
  // head() {
  //   return {
  //     meta: [
  //       {hid: 'og:image', property: 'og:image', content: this.$api.axios_baseURL + "/static/images/domains/licci/icon.png",
  //         href:this.$api.axios_baseURL + "/static/images/domains/licci/icon.png"}
  //     ]
  //   }
  // },
  computed: {
    menu_over() {
      return this.is_domain_page
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
  watch: {
    is_offline(offline) {
      if (offline) {
        this.clear_entries()
        this.$store.commit("search/clear")
        if (!["offline", "offline_settings", "about", "entry"].includes(this.$route.name)) {
          this.$router.push("/offline")
        }
        this.ok_snackbar("EN:offline")
        this.disconnected()
        this.persist_for_offline_mode()
        this.set_home_to_offline()
      } else {
        this.ok_snackbar("EN:Online")
        this.reset_home()
      }
    }
  }
}
</script>

<style>
.help_button {
  position: fixed;
  bottom: 40px;
  left: 3%;
  z-index: 1000;
}
</style>
