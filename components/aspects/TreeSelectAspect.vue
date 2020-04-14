<template lang="pug">
  div(v-if="!readOnly")
    v-autocomplete(
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
    v-dialog(width="800" v-model="dialogOpen")
      TreleafPicker(
        :tree="tree"
        :attr="aspect.attr"
        v-on:selected="selected($event)"
        :disabled="disabled"
        :keep_selection="true")
  div(v-else)
    div {{value}}
</template>

<script>
  import TreleafPicker from "../input/TreleafPicker";
  import TextShort from "./TextShortAspect";
  import {flatten_tree_to_options, get_codes_as_tree} from "../../lib/options";
  import {EDIT} from "../../lib/consts";
  import AspectComponentMixin from "./AspectComponentMixin";

  export default {
    name: "TreeSelectAspect",
    components: {TextShort, TreleafPicker},
    mixins: [AspectComponentMixin],
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
