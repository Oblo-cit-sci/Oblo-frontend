<template lang="pug">
  div(v-if="!readOnly")
    div(v-if="is_edit_mode && !selected_aspect")
      SingleSelect(
        :options="options"
        :select_sync="false"
        @selection="option_selected($event)"
        :only_value="true")
    div(v-if="selected_option")
      Aspect(
        :aspect="selected_aspect"
        :aspect_loc="aspect_loc"
        @update:ext_value="update_value($event)"
        :extra="extra"
        mode="edit")
  div(v-else)
    div(v-if="!selected_aspect")
      p No option selected
    div(v-if="selected_option")
      Aspect(
        :aspect="selected_aspect"
        :aspect_loc="aspect_loc"
        :extra="extra")
</template>

<script>

  import Aspect from "../Aspect"
  import {aspect_default_value} from "~/lib/aspect";
  import SingleSelect from "../input/SingleSelect";
  import {OPTION} from "~/lib/consts";
  import {string_list2options} from "~/lib/options";
  import AspectComponentMixin from "./AspectComponentMixin";

  export default {
    name: "OptionsAspect",
    components: {SingleSelect, Aspect},
    mixins: [AspectComponentMixin],
    data() {
      return {
        selected_option: null,
        selected_aspect: null,
        opt_values: [],
        options: string_list2options(this.$_.map(this.aspect.options, o => o.name))
      }
    },
    created() {
      if(this.aspect.attr.unpacked || this.$_.some(this.aspect.options, o => o.attr.unpacked)) {
        console.log("Warning, Neither the optionsaspect nor one of its options can be unpacked", this.aspect.name)
      }
      if (this.mvalue.hasOwnProperty(OPTION)) {
        this.option_selected(this.mvalue.option, false)
      }
    },
    methods: {
      option_selected(option, selected = true) {
        this.selected_option = option
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
    }
  }
</script>

<style scoped>

</style>

