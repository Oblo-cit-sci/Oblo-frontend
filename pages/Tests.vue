<template lang="pug">
  div
    AspectDialog
</template>

<script>


  import AspectDialog from "~/components/aspect_utils/AspectDialog"

  export default {
    name: "Tests",
    mixins: [],
    components: {AspectDialog},
    created() {
    },
    data() {
      return {
        domains: {
          name:"domains",
          type: "select",
          attr: {}

        }
      }
    },
    computed: {},
    methods: {},
    watch: {}
  }
</script>

<style scoped>

</style>
