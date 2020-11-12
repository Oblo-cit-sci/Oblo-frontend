export default {
  name: "ResponsivenessMixin",
  computed: {
    bp() {
      return this.$vuetify.breakpoint
    },
    mobile() {
      return this.bp.mobile
    },
    has_touch() {
      return (('ontouchstart' in window)
        || (navigator.MaxTouchPoints > 0)
        || (navigator.msMaxTouchPoints > 0))
    },
    is_xsmall() {
      return this.bp.xs
    },
    is_small() {
      return this.bp.smAndDown
    },
    is_md() {
      return this.bp.md
    },
    smAndUp() {
      return this.bp.smAndUp
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
