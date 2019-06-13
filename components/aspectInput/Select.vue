<template lang="pug">
  div
    v-checkbox(v-if="select_check" v-model="check_box_value" :label="check_box_value ? this.options[1].text : this.options[0].text")
    SingleSelect(v-else :options="options"
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
        selection: null,
        options: [],
        code: null, // if not null: name, version
        select_check: false, // attr.select = "check"
        check_box_value: null
      }
    },
    created() {
      if (typeof this.aspect.items === "string") {
        if (this.aspect.items.startsWith("*")) {
          this.options = get_codes_as_options(this.$store.state, this.aspect.items)
        }
      } else if (this.aspect.items instanceof Array) {
        if (this.aspect.attr.hasOwnProperty("select") && this.aspect.attr.select === "check") {
          this.select_check = true
          this.check_box_value = false // or maybe a value/default...
          if(this.aspect.items.length !== 2) {
            console.log("Aspect ",this.aspect.name,"is a select with check but has not exactly 2 items")
          }
        }
        this.options = string_list2options(this.aspect.items)

      } else {
        console.log("ERROR cannot create options from aspect items", this.aspect.items)
      }
      //console.log("init select with val", this.value)
      if (this.value !== null) {
        this.selection = this.$_.find(this.options, (o) => {
          return o.value === this.value
        })
      }
    },
    watch: {
      selection() {
        console.log("selection update", this.selection)
        if (this.selection === null)
          this.value_change(null)
        else
          this.value_change(this.selection.value)
      },
      disabled() {
        this.selection = null
      },
      check_box_value(val) {
        this.i_value = val ? this.options[1].value : this.options[0].value
        this.value_change(this.i_value)
      }
    }
  }
</script>

<style scoped>

</style>
