<template lang="pug">
  div(v-if="!readOnly")
    v-checkbox(
      v-if="select_check"
      v-model="check_box_value"
      :label="check_box_value ? options[1].text : options[0].text")
    SingleSelect(v-else :options="options"
      :selection.sync="selection"
      :force_view="force_view"
      :disabled="disabled"
      :hide_details="hide_details"
      :clearable="!is_required")
  div(v-else)
    div.mt-3(v-if="value")
      div
        div.px-2(v-if="has_some_icons" style="float:left")
          v-img(:src="icon_path(selection)" contain max-height="40")
        div
          p.pl-2(v-if="select_check" class="text-uppercase") {{check_box_value ? options[1].text : options[0].text}}
          p.body-1.readonly-aspect.pl-3(v-else) {{selection.text}}
        div.pt-2(v-if="selection.description" style="clear:left") {{$t('comp.select_asp.descr')}} {{selection.description}}
</template>

<script>
  import SelectMixin from "./SelectMixin";
  import AspectComponentMixin from "./AspectComponentMixin";
  import {server_icon_path} from "~/lib/client"

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
      },
      icon_path(item) {
        return server_icon_path(this.$axios, item.icon)
      },
    },
    computed: {
      force_view() {
        return this.aspect.attr.force_view
      },
      has_some_icons() {
        // o._icon is basically just for privacy, check if
        return this.$_.find(this.options, (o) => o.icon && o.icon !== "") !== undefined
      },
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
