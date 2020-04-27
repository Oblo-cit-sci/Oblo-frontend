<template lang="pug">
  div
    Tree(:tree="tree" :max_level="3" selectable)
</template>

<script>

  import Tree from "~/components/aspect_utils/Tree"
  import {get_codes_as_tree} from "~/lib/options"

  const ld = require("lodash")

  export default {
    name: "Tests",
    components: {Tree},
    created() {
      this.tree  = get_codes_as_tree(this.$store, "general_licci_tree")
      console.log(this.tree)
    },
    data() {
      return {

      }
    },
    computed: {},
    methods: {

    }
  }
</script>

<style scoped>

</style>
