<template lang="pug">
  div
    a(:href="url")
      span {{title_view}}
    v-btn(:href="url"  target="_blank" icon)
      v-icon mdi-open-in-new
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
      title_view(){
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
