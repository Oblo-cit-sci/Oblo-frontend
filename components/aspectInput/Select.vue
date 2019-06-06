<template lang="pug">
  div
    SingleSelect(:options="options"
      v-bind:selection.sync="selection"
      :disabled="disabled")
</template>

<script>
  import AspectMixin from "./AspectMixin"
  import SingleSelect from "../SingleSelect"
  import {get_codes_as_options, string_list2options} from "../../lib/client"


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
      console.log("Select created")
      if (typeof this.aspect.items === "string") {
        if (this.aspect.items.startsWith("*")) {
          this.options = get_codes_as_options(this.$store.state, this.aspect.items)
        }
      } else if (this.aspect.items instanceof Array) {
        this.options = string_list2options(this.aspect.items)
      } else {
        console.log("ERROR cannot create options from aspect items", this.aspect.items)
        this.options = []
      }
      if (this.value !== null) {
        this.selection = this.$_.find(this.options, (o) => {
          return o.key === this.i_value
        })
      }
    },
    watch: {
      selection() {
        if (this.selection === null)
          this.value_change(null)
        else
          this.value_change(this.selection.value)
      },
      disabled() {
        this.selection = null
      }
    }
  }
</script>

<style scoped>

</style>
