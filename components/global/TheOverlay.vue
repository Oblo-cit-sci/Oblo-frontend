<template lang="pug">
  v-overlay(absolute :value="overlay")
    v-progress-circular(:color=color indeterminate size="64")
</template>

<script>
import {BUS_HIDE_OVERLAY, BUS_OVERLAY} from "~/plugins/bus";

export default {
  name: "TheOverlay",
  data() {
    return {
      overlay: false,
      color: null
    }
  },
  created() {
    this.$bus.$on(BUS_OVERLAY, (color) => {
      // this.color = color // ?
      this.overlay = true
    })
    this.$bus.$on(BUS_HIDE_OVERLAY, () => {
      this.overlay = false
    })
  }
}
</script>

<style scoped>

</style>
