export default {
  name: "goToMiddleware",
  mounted() {
    if (this.$route.hash) {
      this.$vuetify.goTo(this.$route.hash)
    }
  }
}
