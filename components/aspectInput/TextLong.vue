<template lang="pug">
  div
    v-textarea("outline" :label="aspect.name"  v-model="value")
</template>

<script>
    export default {
        props: ["aspect"],
        data() {
          return {
            value: ""
          }
        },
        name: "TextLong"
    }
</script>

<style scoped>

</style>
