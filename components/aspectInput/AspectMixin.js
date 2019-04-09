export default {
  data: function () {
    return {
      value: null
    }
  },
  watch: {
    value() {
      //console.log("value change");
      this.$emit("update", {
        value: this.value,
        // TODO should be in that Aspect, probably a prop
        complete: this.value !== "",
        aspect: this.aspect || "no aspect"
      })
    }
  }
}
