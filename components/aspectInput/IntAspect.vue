<template lang="pug">
  div
    v-text-field("outline" :label="aspect.name"  v-model="value" type="int")
</template>

<script>
  export default {
    name: "IntAspect",
    props: ["aspect"],
    data() {
      return {
        value: 0
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
