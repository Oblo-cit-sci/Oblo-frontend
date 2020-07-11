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
      v-textarea(
        :prepend-icon="prependIcon"
        @click:prepend="openDialog"
        hide-details
        readonly
        solo
        auto-grow
        :rows="1"
        clearable
        @click:clear="clear"
        flat
        @click="open_if_empty"
        :placeholder="$t('comp.treeselect_asp.click_to_select')"
        :value="value_text")
    v-dialog(width="800" v-model="dialogOpen" height="100%")
      TreeleafPicker(
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
  import TreeleafPicker from "../input/TreeleafPicker";
  import TextShort from "./TextShortAspect";
  import {flatten_tree_to_options, get_codes_as_tree} from "~/lib/options";
  import {EDIT} from "~/lib/consts";
  import AspectComponentMixin from "./AspectComponentMixin";
  import GeneralSelectMixin from "~/components/aspect_utils/GeneralSelectMixin"

  export default {
    name: "TreeSelectAspect",
    components: {TextShort, TreeleafPicker},
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
      // console.log("created", this.extra, this.value)
      if(this.extra.listitem && !this.value) {
        this.dialogOpen = true
      }
    },
    methods: {
      openDialog(short_persistence) {
        if (!this.disabled) {
          this.dialogOpen = true
        }
      },
      open_if_empty() {
        if(!this.disabled && !this.value) {
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
      },
      clear() {
        this.update_value(null)
        this.$emit("aspectAction", {action:"clear"})
      }
    },
    computed: {
      prependIcon() {
        return this.readOnly ? '' : 'mdi-file-tree'
      },
      direct_select() {
        // console.log(this.aspect.attr.direct_select)
        if (!this.aspect.attr.hasOwnProperty("direct_select"))
          return true
        else {
          return this.aspect.attr.direct_select
        }
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
