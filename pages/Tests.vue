<template lang="pug">
  div
    v-autocomplete(
      :search-input.sync="search_query"
      v-model="value"
      :items="options"
    )
</template>

<script>


  export default {
    name: "Tests",
    mixins: [],
    components: {},
    created() {
    },
    data() {
      return {
        search_query: "super cool",
        value: "super cool",
        init_catch: true,
        options: []
      }
    },
    computed: {},
    methods: {},
    watch: {
      search_query(value, old_value) {
        console.log("watch sq", value)
        if (!value && this.init_catch) {
          console.log("catch")
          this.search_query = old_value
          this.init_catch = false
          this.options = [old_value]
        }
      }
    }
  }
</script>

<style scoped>

</style>
