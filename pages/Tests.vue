<template lang="pug">
  div
    SelectGrid
    SimplePaginate(v-model="page" :total_pages="20")
</template>

<script>


  import SelectGrid from "../components/aspects/SelectGrid";
  import SimplePaginate from "../components/SimplePaginate";

  const ld = require("lodash")

  export default {
    name: "Tests",
    components: {SimplePaginate, SelectGrid},
    mounted() {
    },
    created() {
    },
    data() {
      return {
        page: 0,
        total_pages: 10
      }
    },
    computed: {},
    methods: {}
  }
</script>

<style scoped>

</style>
