<template lang="pug">
  v-overlay(absolute :value="overlay")
    v-progress-circular(:color=color indeterminate size="64")
</template>

<script>
export default {
  name: "TheOverlay",
  data() {
    return {
      overlay: false,
      color: null
    }
  },
  created() {
    this.$bus.$on("overlay", (color) => {
      // this.color = color // ?
      this.overlay = true
    })
    this.$bus.$on("hide-overlay", () => {
      this.overlay = false
    })
  }
}
</script>

<style scoped>

</style>
