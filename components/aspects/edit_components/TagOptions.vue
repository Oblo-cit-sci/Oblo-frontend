<template lang="pug">
  div(v-if="!is_view_mode")
    div(v-if="is_edit_mode && !selected_aspect")
      SingleSelect(
        :options="options"
        :select_sync="false"
        @selection="option_selected($event)"
        :disabled_options="disabled_options"
        :only_value="true")
    div(v-if="selected_aspect")
      Aspect(
        :aspect="selected_aspect"
        :aspect_loc="aspect_loc"
        :ext_value="i_value"
        @update:ext_value="update_value($event)"
        :extra="extra"
        mode="edit")
</template>

<script>
import AspectComponentMixin from "~/components/aspects/AspectComponentMixin"
import SingleSelect from "~/components/input/SingleSelect"
import Aspect from "~/components/Aspect"
import {object_list2options} from "~/lib/options"
import {OPTION, TEMPLATE} from "~/lib/consts"
import {aspect_default_value, unpack} from "~/lib/aspect"
import {get_code_of_template} from "~/lib/codes"
import {mapGetters} from "vuex";

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
    if (this.mvalue.hasOwnProperty(OPTION)) {
      this.option_selected(this.mvalue.option, false)
    }
  },
  methods: {
    option_selected(option, selected = true) {
      // console.log(option, selected)
      this.selected_option = option
      // console.log("option_selected", option)
      this.selected_aspect = this.$_.find(this.aspect.options, o => o.name === option)
      if (selected) {
        let value = aspect_default_value(this.selected_aspect)
        // call method
        this.$emit("update_value", {option, value, is_mvalue:true})
      }
    },
    update_value(value) {
      // console.log("options.. update", value)
      this.$emit("update_value", {option: this.selected_option, value, is_mvalue:true})
    }
  },
  computed: {
    ...mapGetters({domain_language: "user/settings_domain_language"}),
    disabled_options() {
      const template_filter = this.$_.find(this.conditionals, cf => cf.name === TEMPLATE)
      // NEW APPROACH: ONLY INCLUDE TAGS THAT ARE INCLUDED IN ALL SELECTED TEMPLATES
      if (template_filter) {
        // console.log("template_filter", template_filter.value)
        const all_templates_codes = unpack(template_filter.value).map(template_slug => get_code_of_template(this.$store, template_slug, this.domain_language))
        return this.options.filter(o => !this.$_.some(all_templates_codes, codes => codes.includes(o.value))).map(o => o.value)
      } else { // actually never happens
        return []
      }
    },
    i_value() {
      console.log(this.value, this.selected_option, this.selected_aspect)
      if (!this.value) {
        return this.aspect_default_value(this.selected_aspect)
      }
      return this.value

    }
  }
}
</script>

<style scoped>

</style>
