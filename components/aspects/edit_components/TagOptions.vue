<template lang="pug">
  div(v-if="!readOnly")
    div(v-if="is_edit_mode && !selected_aspect")
      SingleSelect(
        :options="options"
        :select_sync="false"
        @selection="option_selected($event)"
        :disabled_options="disabled_options"
        :only_value="true")
    div(v-if="selected_option")
      Aspect(
        :aspect="selected_aspect"
        :aspect_loc="aspect_loc"
        @update:ext_value="update_value($event)"
        :extra="extra"
        mode="edit")
</template>

<script>
import AspectComponentMixin from "~/components/aspects/AspectComponentMixin"
import SingleSelect from "~/components/input/SingleSelect"
import Aspect from "~/components/Aspect"
import {object_list2options} from "~/lib/options"
import {OPTION} from "~/lib/consts"
import {aspect_default_value} from "~/lib/aspect"
import {get_code_of_template} from "~/lib/codes"

export default {
  name: "TagOptions",
  components: {SingleSelect, Aspect},
  mixins: [AspectComponentMixin],
  data() {
    return {
      selected_option: null,
      selected_aspect: null,
      opt_values: [],
      options: object_list2options(this.aspect.options, "label", "name", true, ["description"])
    }
  },
  created() {
    if (this.aspect.attr.unpacked || this.$_.some(this.aspect.options, o => o.attr.unpacked)) {
      console.log("Warning, Neither the optionsaspect nor one of its options can be unpacked", this.aspect.name)
    }
    if (this.mvalue.hasOwnProperty(OPTION)) {
      this.option_selected(this.mvalue.option, false)
    }
  },
  methods: {
    option_selected(option, selected = true) {
      this.selected_option = option
      // console.log("option_selected", option)
      this.selected_aspect = this.$_.find(this.aspect.options, o => o.name === option)
      if (selected) {
        let value = aspect_default_value(this.selected_aspect)
        value.option = option
        // call method
        this.$emit("update_value", value, true, false)
      }
    },
    update_value(value) {
      // console.log("options.. update", value)
      this.$emit("update_value", {option: this.selected_option, value: value})
    }
  },
  computed: {
    disabled_options() {
      const template_filter = this.$_.find(this.conditionals, cf => cf.name === "template")
      // NEW APPROACH: ONLY INCLUDE TAGS THAT ARE INCLUDED IN ALL SELECTED TEMPLATES
      if (template_filter) {
        console.log(template_filter.value)
        const all_templates_codes = template_filter.value.map(template_slug => get_code_of_template(this.$store, template_slug))
        return this.options.filter(o => !this.$_.every(all_templates_codes, codes => codes.includes(o.value))).map(o => o.value)
      } else { // actually never happens
        return []
      }
    }
  }
}
</script>

<style scoped>

</style>
