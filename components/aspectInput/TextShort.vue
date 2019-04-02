<template lang="pug">
    div
      v-text-field("outline" :label="aspect.name"  v-model="value")
</template>

<script>
    export default {
        name: "TextShort",
        props: ["aspect"],
        data() {
          return {
            value: ""
          }
        }
    }
</script>

<style scoped>

</style>
