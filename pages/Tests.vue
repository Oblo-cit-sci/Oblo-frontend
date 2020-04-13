<template lang="pug">
  div
    LargeSelectList
    div.mb-5.mt-5
    v-expansion-panels(flat)
      v-expansion-panel
        v-expansion-panel-header more options
        v-expansion-panel-content
          div
            div Cool
            div click here
</template>

<script>


  import SelectGrid from "../components/aspect_utils/SelectGrid";
  import SimplePaginate from "../components/SimplePaginate";
  import ActorSearch from "../components/ActorSearch";
  import LargeSelectList from "../components/aspect_utils/LargeSelectList"

  const ld = require("lodash")

  export default {
    name: "Tests",
    components: {LargeSelectList, SelectGrid},
    mounted() {
    },
    created() {
    },
    data() {
      return {
      }
    },
    computed: {},
    methods: {}
  }
</script>

<style scoped>

</style>
