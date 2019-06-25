export default {
  name: "TexfieldAspect",
  data() {
    return {
      hideDetails: true,
      hint: undefined,
      rules: undefined
    }
  },
  created() {
    if (this.aspect.attr.hasOwnProperty("extra")) {
      const extra = this.aspect.attr.extra
      if (extra.hasOwnProperty("rules")) {
        this.hideDetails = false
        this.rules = extra.rules
      }
      this.hint = extra.hint
      if (this.hint)
        this.hideDetails = false
    }
  }
}

