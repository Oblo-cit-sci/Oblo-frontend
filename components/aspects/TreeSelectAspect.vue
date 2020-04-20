<template lang="pug">
  div(v-if="!readOnly")
    v-autocomplete(v-if="direct_select"
      outlined
      single-line
      :disabled="disabled"
      clearable
      :items="flat_options"
      :value="value"
      :hide-details="hide_details"
      @change="update_value($event)"
      :aspect_loc="aspect_loc"
      :prependIcon="prependIcon"
      @click:prepend="openDialog()")
    div(v-if="!direct_select")
      v-btn(:color="button_color" @click="openDialog")
        v-icon {{prependIcon}}
        span {{button_text}}
      span {{value_text}}
    v-dialog(width="800" v-model="dialogOpen" height="100%")
      TreleafPicker(
        :tree="tree"
        :attr="aspect.attr"
        :data_source="data_source"
        @selected="selected($event)"
        :disabled="disabled"
        :keep_selection="true")
  div(v-else)
    div {{value_text}}
</template>

<script>
  import TreleafPicker from "../input/TreleafPicker";
  import TextShort from "./TextShortAspect";
  import {flatten_tree_to_options, get_codes_as_tree} from "~/lib/options";
  import {EDIT} from "~/lib/consts";
  import AspectComponentMixin from "./AspectComponentMixin";
  import GeneralSelectMixin from "~/components/aspect_utils/GeneralSelectMixin"

  export default {
    name: "TreeSelectAspect",
    components: {TextShort, TreleafPicker},
    mixins: [AspectComponentMixin, GeneralSelectMixin],
    data() {
      return {
        tree: {},
        flat_options: [],
        dialogOpen: false,
      }
    },
    created() {
      if (this.mode === EDIT) {
        this.calc_options()
      }
    },
    methods: {
      openDialog(short_persistence) {
        if (!this.disabled) {
          this.dialogOpen = true
        }
      },
      selected(val) {
        this.dialogOpen = false;
        if (val) {
          this.update_value(val.value)
        }
      },
      calc_options() {
        // build the given_options (all tree available) from what is passed
        // let passed_tree = this.aspect.items;
        if (typeof this.aspect.items === "string") {
          this.tree = get_codes_as_tree(this.$store, this.aspect.items)
        } else {
          this.tree = this.aspect.items
        }
        let options = {}
        if (this.aspect.attr.allow_select_levels) {
          options.include_levels = this.aspect.attr.allow_select_levels
        } else {
          options.include_levels = [this.tree.level_names.length - 1]
        }
        // console.log(this.tree, options.include_levels)
        this.flat_options = flatten_tree_to_options(this.tree, options)
      }
    },
    computed: {
      prependIcon() {
        return this.readOnly ? '' : 'mdi-file-tree'
      },
      direct_select() {
        console.log(this.aspect.attr.direct_select)
        if (!this.aspect.attr.hasOwnProperty("direct_select"))
          return true
        else {
          return this.aspect.attr.direct_select
        }
      },
      button_color() {
        if(this.value) {
          return null
        } else {
          return "success"
        }
      },
      button_text() {
        if (this.value)
          return ""
        else
          return "click to select"
      },
      value_text() {
        if (this.value) {
          if(this.value.constructor === Array) {
            return this.value.map(v => v.text).join(" \u21D2 ")
          } else {
            return this.value
          }
        }
      }
    },
    watch: {
      mode(new_mode) {
        if (new_mode === EDIT && this.$_.isEmpty(this.tree)) {
          this.calc_options()
        }
      }
    }
  }
</script>

<style scoped>


</style>
