<template lang="pug">
  div
    a(:href="url"  target="_blank" )
      span.body-1.readonly-aspect.break_word {{title_view}}
    v-btn.my-0(v-if="value" :href="url"  target="_blank" icon height="24px")
      v-icon mdi-open-in-new
</template>

<script>
  import AspectComponentMixin from "~/components/aspects/AspectComponentMixin"
  export default {
    name: "UrlView",
    mixins: [AspectComponentMixin],
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
