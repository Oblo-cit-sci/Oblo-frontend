<template lang="pug">
  div
    v-chip(v-for="(item, index) in meta_aspects" :key="index"
      :ripple="false"
      small
      class="mr-4"
      :color="color(item)"
      label)
      v-avatar(v-if="item.icon")
        v-icon(small) {{item.icon}}
      p.ma-1 {{item.name}}
</template>

<script>

  import {PRIVATE, PUBLIC} from "../lib/consts"

  export default {
    name: "MetaChips",
    props: {
      meta_aspects: {
        type: Array,
        default: () => []
      }
    },
    methods: {
      color(item) {
        if (item.name === PUBLIC) {
          return "#d3e6d0"
        } else if (item.name === PRIVATE) {
          return "#e6dbd0"
        }
      }
    }
  }
</script>

<style scoped>
</style>
