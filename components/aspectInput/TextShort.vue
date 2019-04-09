<template lang="pug">
  div
    v-text-field("outline" :label="aspect.name"  v-model="value")
</template>

<script>
  import AspectMixin from "./AspectMixin";

  export default {
    name: "TextShort",
    props: ["aspect"],
    mixins: [AspectMixin],
  }
</script>

<style scoped>

</style>
