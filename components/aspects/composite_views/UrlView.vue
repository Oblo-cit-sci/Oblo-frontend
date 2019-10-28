<template lang="pug">
  p {{title}}:
    a(:href="url" target="_blank") {{url}}
</template>

<script>
  import AspectMixin from "../AspectMixin";
  export default {
    name: "UrlView",
    mixins: [AspectMixin],
    props: {
      title: String
    },
    computed: {
      title(){
        return this.title ? this.title : this.value
      },
      url() {
        return this.value
      }
    }
  }
</script>

<style scoped>

</style>
