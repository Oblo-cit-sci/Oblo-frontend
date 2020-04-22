<template lang="pug">
  div
    LargeSelectList
    div.mb-5.mt-5
      SimpleExpansionPanel(title="more options" :content_texts="['cool','not cool']")
</template>

<script>


  import SelectGrid from "../components/aspect_utils/SelectGrid";

  import LargeSelectList from "../components/aspect_utils/LargeSelectList"
  import SimpleExpansionPanel from "~/components/util/SimpleExpansionPanel"

  const ld = require("lodash")

  export default {
    name: "Tests",
    components: {SimpleExpansionPanel, LargeSelectList, SelectGrid},
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
