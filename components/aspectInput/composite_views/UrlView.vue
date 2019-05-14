<template lang="pug">
  div
    h3 {{aspect.name}}
    a(:href="value.url" target="_blank") {{value.title}}
</template>

<script>
  import AspectMixin from "../AspectMixin";

  export default {
    name: "UrlView",
    mixins: [AspectMixin]
  }
</script>

<style scoped>

</style>
