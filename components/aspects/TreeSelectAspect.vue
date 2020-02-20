<template lang="pug">
  div(v-if="!readOnly")
    v-autocomplete(
      outlined
      single-line
      :disabled="disabled"
      clearable
      :items="flat_options"
      :value="value"
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
  import {flatten_tree_to_options, get_codes_as_options, get_codes_as_tree} from "../../lib/options";
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
      // todo move this to a function
      if (this.mode === EDIT) {
        // build the given_options (all tree available) from what is passed
        // let passed_tree = this.aspect.items;
        this.tree = get_codes_as_tree(this.$store, this.aspect.items)

        // a "*" means, lookup code and set the values as tree

        // if (typeof (passed_tree) === "string") {
        //     let type_char = passed_tree.charAt(0);
        //     //console.log("tree, cja", type_char, )
        //     if (type_char === "*") {
        //         //console.log("tree")
        //         this.tree = this.$store.getters.get_code(passed_tree.substring(1));
        //     }
        // }
        // flat_options // TODO maybe store them...
        let options = {}
        if (this.aspect.attr.allow_select_levels) {
          options.include_levels = this.aspect.attr.allow_select_levels
        }
        this.flat_options = flatten_tree_to_options(this.tree, options)
        //console.log(this.flat_options)
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
      }
    },
    computed: {
      prependIcon() {
        return this.readOnly ? '' : 'mdi-file-tree'
      }
    }
  }
</script>

<style scoped>


</style>
