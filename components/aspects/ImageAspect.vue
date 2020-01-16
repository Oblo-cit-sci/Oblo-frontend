<template lang="pug">
  v-row
    v-col()


</template>

<script>
  import AspectMixin from "./AspectMixin";

  export default {
    name: "ImageAspect",
    mixins: [AspectMixin],
    components: {},
    props: {},
    data() {
      return {
        fake_data: []
      }
    },
    created() {
      for(let i in [...Array(8).keys()]) {
        this.fake_data[i] = "https://picsum.photos/500/300?image=" + (i * 5 + 10)
      }
      console.log(this.fake_data)
    },
    computed: {},
    methods: {},
    watch: {}
  }
</script>

<style scoped>

</style>
