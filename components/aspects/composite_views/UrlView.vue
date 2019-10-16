<template lang="pug">
  p {{title}}: 
    a(:href="url" target="_blank") {{url}}
</template>

<script>
  import AspectMixin from "../AspectMixin";
  export default {
    name: "UrlView",
    mixins: [AspectMixin],
    computed: {
      title(){
        return this.value.Title.value
      },
      url() {
        return this.value.URL.value
      }
    }
  }
</script>

<style scoped>

</style>
