<template lang="pug">
  v-banner(v-if="show_profile_complete_banner" sticky single-line :style="{'z-index':5}" color="info" height="60")
    nuxt-link(:style="{'color':'white'}" to="/profile?edit=true") {{$t("comp.notification_banner.complete_profile")}}
    v-btn(icon nuxt to="/profile?edit=true" color="white" )
      v-icon mdi-arrow-right
</template>

<script>
  import {USER} from "~/store"

  export default {
    name: "NotificationBanner",
    mixins: [],
    components: {},
    props: {},
    data() {
      return {}
    },
    computed: {
      show_profile_complete_banner() {
        const cs = this.$store.getters[USER].config_share
        if (this.$route.name === "profile" && this.$route.query.edit) {
          return false
        }
        if (cs.hasOwnProperty("profile_edited")) {
          return !cs.profile_edited
        } else {
          return false
        }
      },
    },
    methods: {}
  }
</script>

<style scoped>

</style>
