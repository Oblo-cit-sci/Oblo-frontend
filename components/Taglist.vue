<template lang="pug">
  div
    v-chip(v-for="tag in tags" :key="tag.name") {{tag.name}}
      v-icon(v-if="tag.hasOwnProperty('icon')") {{tag.icon}}
</template>

<script>
  export default {
    name: "Taglist",
    props: ['tags']
  }
</script>

<style scoped>

</style>
