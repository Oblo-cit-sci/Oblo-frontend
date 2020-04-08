<template lang="pug">
  div
    LargeSelectList
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
