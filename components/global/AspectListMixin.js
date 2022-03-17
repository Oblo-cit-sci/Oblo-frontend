
export default {
  name: "AspectListMixin",
  computed: {
    base_cols() {
      if (this.$route.name === "entry") {
        if (this.$vuetify.breakpoint.smAndDown) {
          return 12
        }
        if (this.$vuetify.breakpoint.mdAndDown) {
          return 10
        } else {
          return 8
        }
      } else
        return 12
    },
  }
}
