<template lang="pug">
  div
    v-text-field("outline" :label="aspect.name"  v-model="value"  mask="####")
</template>

<script>
  import AspectMixin from "./AspectMixin";

  export default {
    name: "IntAspect",
    props: ["aspect"],
    mixins: [AspectMixin],
    data() {
      return {}
    },
    created() {
      this.value = 0;
    },
  }
</script>

<style scoped>

</style>
