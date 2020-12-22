<template lang="pug">
  div(v-if="!is_view_mode")
    LanguageCodeFallback(v-if="!code_entry_language_match")
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
          p.body-1.readonly-aspect.pl-3(v-else) {{view_mode_text}}
        div.pt-2(v-if="view_mode_description" style="clear:left") {{$t('comp.select_asp.descr')}}: {{view_mode_description}}
</template>

<script>
import SelectMixin from "./SelectMixin";
import AspectComponentMixin from "./AspectComponentMixin";
import {server_icon_path} from "~/lib/client"
import LanguageCodeFallback from "~/components/aspect_utils/LanguageCodeFallback";
import SingleSelect from "~/components/input/SingleSelect";

export default {
  name: "SelectAspect",
  components: {SingleSelect, LanguageCodeFallback},
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
  // beforeCreate: function () {
  //   this.$options.components.SingleSelect = require('../input/SingleSelect.vue').default
  // },
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
      console.log("set-sel: value", this.value)
      // debugger
      if (this.value !== null) {
        // console.log(this.value)
        this.selection = this.$_.find(this.options, (o) => {
          return o.value === this.value
        })
        if (this.selection === undefined) {
          this.selection = null
        }
      } else {
        // console.log(this.selection)
        this.selection = null
        this.init = false
      }
    },
    icon_path(item) {
      return server_icon_path(this.$axios, item.icon)
    },
  },
  computed: {
    force_view() {
      return this.attr.force_view
    },
    has_some_icons() {
      // o._icon is basically just for privacy, check if
      return this.$_.find(this.options, (o) => o.icon && o.icon !== "") !== undefined
    },
    has_error() {
      // console.log("select error?", this.is_required)
      return this.is_required && !this.value
    },
    view_mode_text() {
      // console.log(this.selection)
      if (this.selection) {
        return this.selection.text || this.selection.value
      }
    },
    view_mode_description() {
      if (this.selection) {
        return this.selection.description
      }
    }
  },
  watch: {
    value() {
      this.set_selection()
    },
    has_error() {
      this.update_error(this.has_error)
    },
    selection() {
      let send_value = this.selection
      console.log("watch sel",)

      //console.log("Select-selection", this.selection, "/",val, "/",prev_val, !prev_val)
      if (this.init) {
        this.init = false
        return
      }
      //console.log("select", this.aspect, this.selection)
      if (this.selection === null)
        this.update_value(null)
      else {
        if (this.attr.only_value) {
          send_value = this.selection
        }
        this.update_mvalue(send_value)
      }
    },
    check_box_value(val) {
      this.update_value(val ? this.options[1].value : this.options[0].value)
    }
  }
}
</script>

<style scoped>

</style>
