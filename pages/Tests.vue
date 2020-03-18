<template lang="pug">
  div
    SelectGrid
</template>

<script>


  import SelectGrid from "../components/aspects/SelectGrid";
  import SimplePaginate from "../components/SimplePaginate";
  import ActorSearch from "../components/ActorSearch";

  const ld = require("lodash")

  export default {
    name: "Tests",
    components: {SelectGrid},
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
