<template lang="pug">
  v-banner.notification_banner(v-if="show_profile_complete_banner" sticky single-line color="info" height="60")
    nuxt-link(:style="{'color':'white'}" :to="link") {{missing_text}}
    v-btn(icon nuxt :to="link" color="white" )
      v-icon mdi-arrow-right
</template>

<script>
import FixDomainMixin from "~/components/global/FixDomainMixin"

export default {
  name: "NotificationBanner",
  mixins: [FixDomainMixin],
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {
    profile_edited() {
      return this.$_.get(this.$store.getters.user.config_share, "profile_edited", false)
    },
    fixed_domain_edited() {
      if(!this.is_fixed_domain)
        return true
      const domain_specific_aspects = this.$_.cloneDeep(this.$_.get(this.$store.getters["domain/act_lang_domain_data"], "users.profile.additional_aspects", []))
      // todo here call a function that assigns external conditions

      return  this.$_.isEmpty(domain_specific_aspects) ||
        this.$_.get(this.$store.getters.user.config_share, `domain.${this.is_fixed_domain}`)
    },
    show_profile_complete_banner: function () {
      // dont show banner on profile edit page, or when visititor
      if (this.$route.name === "profile" && this.$route.query.edit || this.$store.getters.user.registered_name === "visitor") {
        return false
      }
      if (!this.profile_edited) {
        return true
      }
      // fixed domain aspects missing
      return !this.fixed_domain_edited
    },
    missing_text() {
      const cs = this.$store.getters.user.config_share
      if (!this.profile_edited) {
        return this.$t("comp.notification_banner.complete_profile")
      }
      if (!this.fixed_domain_edited) {
        return this.$t("comp.notification_banner.complete_domain_aspects", {domain_name: this.$store.getters["domain/act_domain_title"]})
      }
      return ""
    },
    link() {
      const cs = this.$store.getters.user.config_share
      if (!this.profile_edited) {
        return "/profile?edit=true"
      }
      if (!this.fixed_domain_edited) {
        return "/profile?edit=true#domains"
      }
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
