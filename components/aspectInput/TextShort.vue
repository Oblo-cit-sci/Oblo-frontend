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
        },
      created() {

      },
      watch: {
          value() {
            console.log("short text");
            // this.aspect.attr.required
              this.$emit("update", {
                complete: this.value !== "",
                aspect: this.aspect
              } )
          }
      }
    }
</script>

<style scoped>

</style>
