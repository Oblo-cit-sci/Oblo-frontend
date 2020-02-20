<template lang="pug">
  div(v-if="!readOnly")
    v-checkbox(
      v-if="select_check"
      v-model="check_box_value"
      :label="check_box_value ? this.options[1].text : this.options[0].text")
    SingleSelect(v-else :options="options"
      :selection.sync="selection"
      :force_view="force_view"
      :disabled="disabled")
  div(v-else)
    div(v-if="value")
      p(v-if="select_check" class="text-uppercase") {{check_box_value ? this.options[1].text : this.options[0].text}}
      p(v-else) {{this.selection.text}}
</template>

<script>
  import SelectMixin from "./SelectMixin";
  import {VIEW} from "../../lib/consts";
  import AspectComponentMixin from "./AspectComponentMixin";

  export default {
    name: "SelectAspect",
    mixins: [SelectMixin, AspectComponentMixin],
    props: {
      aspect: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        init: true
      }
    },
    beforeCreate: function () {
      this.$options.components.SingleSelect = require('../input/SingleSelect.vue').default
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
        console.log("set_selection", this.value)
        if (this.value !== null) {
          this.selection = this.$_.find(this.options, (o) => {
            return o.value === this.value
          })
          if (this.selection === undefined) {
            this.selection = null
          }
        } else {
          this.selection = null
          this.init = false
        }
        //console.log('SELECT', this.selection)
      }
    },
    computed: {
      force_view() {
        return this.aspect.attr.force_view
      }
    },
    watch: {
      value() {
        this.set_selection()
      },
      selection() {
        //console.log("watch sel", this.selection, this.init)
        //console.log("Select-selection", this.selection, "/",val, "/",prev_val, !prev_val)
        if (this.init) {
          this.init = false
          return
        }
        //console.log("select", this.aspect, this.selection)
        if (this.selection === null)
          this.update_value(null)
        else
          this.update_value(this.selection.value)
      },
      check_box_value(val) {
        this.update_value(val ? this.options[1].value : this.options[0].value)
      }
    }
  }
</script>

<style scoped>

</style>
