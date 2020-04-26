export default {
  name: "LayoutMixin",
  computed: {
    main_container_width_style() {
      return {
        width: this.main_container_with
      }
    },
    main_container_with() {
      console.log("WW")
      if (this.$vuetify.breakpoint.smAndDown) {
        return "100%"
      } else if (this.$vuetify.breakpoint.medium) {
        return "600px"
      } else if (this.$vuetify.breakpoint.lgAndUp) {
        return "900px"
      }
    }
  }
}
