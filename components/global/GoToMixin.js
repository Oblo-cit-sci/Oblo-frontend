export default {
  name: "GoToMixin",
  mounted() {
    if (this.$route.hash) {
      this.$vuetify.goTo(this.$route.hash)
    }
  }
}
