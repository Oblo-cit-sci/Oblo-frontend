<template lang="pug">
  div
    v-checkbox(
      v-if="select_check"
      v-model="check_box_value"
      :label="check_box_value ? this.options[1].text : this.options[0].text"
      :readonly="readOnly")
    SingleSelect(v-else :options="options"
      :selection.sync="selection"
      :disabled="disabled")
</template>

<script>
  import SingleSelect from "../SingleSelect"
  import SelectMixin from "./SelectMixin";
  import AspectMixin from "./AspectMixin";

  export default {
    name: "Select",
    mixins: [AspectMixin, SelectMixin],
    components: {SingleSelect},
    // todo. init is a hack to prevent the first set_selection call to trigger a value_change
    data() {
      return {
        init: true

      }
    },
    created() {
      if (this.select_check) {
        this.check_box_value = this.value === this.options[1].value // or maybe a value/default...
        if (this.aspect.items.length !== 2) {
          console.log("Aspect ", this.aspect.name, "is a select with check but has not exactly 2 items")
        }
      }
      this.set_selection()
    },
    methods: {
      set_selection() {
        if (this.value !== null) {
          this.selection = this.$_.find(this.options, (o) => {
            return o.value === this.value
          })
          if (this.selection === undefined) {
            this.selection = null
          }
        } else {
          this.selection = null
        }
      }
    },
    watch: {
      value() {
        this.set_selection()
      },
      selection() {
        if(this.init) {
          this.init = false
          return
        }
        //console.log("select", this.aspect, this.selection)
        if (this.selection === null)
          this.value_change(null)
        else
          this.value_change(this.selection.value)
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
