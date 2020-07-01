<template lang="pug">
  div
    v-chip.mr-4(v-for="(item, index) in meta_aspects" :key="index"
      :ripple="false"
      small
      :color="item.color"
      label)
      v-avatar(v-if="item.icon")
        v-icon(small) {{item.icon}}
      p.ma-1 {{item.name}}
</template>

<script>

  export default {
    name: "MetaChips",
    props: {
      meta_aspects: {
        type: Array,
        default: () => []
      }
    }
  }
</script>

<style scoped>
</style>
