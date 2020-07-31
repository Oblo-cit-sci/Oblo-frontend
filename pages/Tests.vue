<template lang="pug">
  div
    SelectGrid(:options="options" :max_cell_width="70" no_border)
</template>

<script>


import SelectGrid from "~/components/aspect_utils/SelectGrid"

export default {
  name: "Tests",
  mixins: [],
  components: {SelectGrid},
  async created() {
  },
  data() {
    return {}
  },
  computed: {
    options() {
      return [
        {value: "A", text: "", icon:"images/domains/licci/assets/systems/system_climatic2.png"},
        {value: "A", text: "", icon:"images/domains/licci/assets/systems/system_physical.png"},
        {value: "A", text: "", icon:"images/domains/licci/assets/systems/system_biological.png"},
        {value: "A", text: "", icon:"images/domains/licci/assets/systems/system_human.png"},
      ]
    }
  },
  methods: {},
  watch: {}
}
</script>

<style scoped>

</style>
