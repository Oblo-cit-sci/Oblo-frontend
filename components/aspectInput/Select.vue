<template lang="pug">
  div
    SingleSelect(:options="options" v-bind:selection.sync="selection")
</template>

<script>
  import AspectMixin from "./AspectMixin"
  import SingleSelect from  "../SingleSelect"
  import {get_codes_as_options} from "../../lib/client"


  export default {
    name: "Select",
    mixins: [AspectMixin],
    components: {SingleSelect},
    data() {
      return {
        selection: null
      }
    },
    created() {
      this.options = get_codes_as_options(this.$store.state, this.aspect.items)
      if(this.value !== null) {
        this.selection = this.$_.find(this.options, (o) => {return o.key === this.i_value})
      }
    },
    watch: {
      selection() {
        this.value_change(this.selection.value)
      }
    }
  }
</script>

<style scoped>

</style>
