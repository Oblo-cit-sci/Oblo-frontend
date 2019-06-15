<template lang="pug">
  div
    a(:href="url" target="_blank") {{title}}
</template>

<script>
  import AspectMixin from "../AspectMixin";

  /*
      //
    //
   */
  export default {
    name: "UrlView",
    mixins: [AspectMixin],
    computed: {
      title(){
        return this.value[0].value
      },
      url() {
        return this.value[1].value
      }
    }
  }
</script>

<style scoped>

</style>
