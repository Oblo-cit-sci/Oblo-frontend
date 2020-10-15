export default {
  name: "ResponsivenessMixin",
  computed: {
    bp() {
      return this.$vuetify.breakpoint
    },
    is_xsmall() {
      return this.bp.xs
    },
    is_small() {
      return this.bp.smAndDown
    },
    is_mdAndUp() {
      return this.bp.mdAndUp
    },
    is_large() {
      return this.bp.lgAndUp
    },
    is_xlarge() {
      return this.bp.xlOnly
    }
  }
}
