<template lang="pug">
  div
    v-textarea("outline" :label="aspect.name"  v-model="value")
</template>

<script>
    import AspectMixin from "./AspectMixin";

    export default {
        props: ["aspect"],
        mixins: [AspectMixin],
        data() {
          return {
          }
        },
        name: "TextLong"
    }
</script>

<style scoped>

</style>
