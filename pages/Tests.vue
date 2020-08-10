<template lang="pug">
  div
    div(v-for="name in probe_examples" :key="name")
      h2 {{name}}
      div {{build_list(options_examples[name])}}
      SingleSelect(:options="build_list(options_examples[name])")
</template>

<script>



import OptionsMixin from "~/components/aspect_utils/OptionsMixin"
import TagsMixin from "~/lib/TagsMixin"
import SingleSelect from "~/components/input/SingleSelect"

export default {
  name: "Tests",
  mixins: [OptionsMixin, TagsMixin],
  components: {SingleSelect},
  created() {
    this.options_examples = require("~/lib/test_data/options")
    const results = require("~/lib/test_data/options_results")

  },
  data() {
    return {
      selected: null,
      options_examples: null
    }
  },
  computed: {
    probe_examples() {
      return ["merge_trees"]
      //return Object.keys(this.options_examples)
    },
  },
  methods: {},
  watch: {}
}
</script>

<style scoped>

</style>
