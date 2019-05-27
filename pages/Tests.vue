<template lang="pug">
  v-flex(xs12='' sm8='' md6='')
    div
      v-autocomplete(:items="options" v-model="selected" multiple chips)
</template>

<script>

  import TreleafPicker2 from "../components/TreleafPicker";
  import Licci from "../components/aspectInput/special/Licci";
  import List from "../components/aspectInput/List";

  const ld = require("lodash")

  export default {
    name: "Tests",
    components: {},
    created() {
      this.options = ld.map(this.$store.state.codes["liccis_flat"], (l) => { return {
          text:l,
          value: l
        }})
      this.selected = []
      //this.options =this.$store.state.codes["liccis_flat"]
    },
    data() {
      return {
        options: [],
        //selected: []
      }
    },
    methods: {
      selected(selected_val) {
      }
    }
  }
</script>

<style scoped>

</style>
