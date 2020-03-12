<template lang="pug">
  div
    SelectGrid
    ActorSearch(v-model="actor1")
    ActorSearch(multiple v-model="actors")
</template>

<script>


  import SelectGrid from "../components/aspects/SelectGrid";
  import SimplePaginate from "../components/SimplePaginate";
  import ActorSearch from "../components/ActorSearch";

  const ld = require("lodash")

  export default {
    name: "Tests",
    components: {ActorSearch, SimplePaginate, SelectGrid},
    mounted() {
    },
    created() {
    },
    data() {
      return {
        page: 0,
        total_pages: 10,
        actor1: null,
        actors: null
      }
    },
    computed: {},
    methods: {}
  }
</script>

<style scoped>

</style>
