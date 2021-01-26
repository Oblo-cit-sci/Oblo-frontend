<template lang="pug">
  div(v-if="!is_view_mode")
    LanguageCodeFallback(v-if="!code_entry_language_match" :actual_lang="code_entry_language")
    v-autocomplete(v-if="direct_select && is_empty"
      outlined
      single-line
      :disabled="disabled"
      clearable
      :items="flat_options"
      return-object
      :value="value"
      :hide-details="hide_details"
      @change="auto_select($event)"
      :aspect_loc="aspect_loc"
      :prependIcon="prependIcon"
      @click:prepend="openDialog()")
    div(v-if="!direct_select || !is_empty")
      v-textarea(
        :flat="!is_empty"
        :solo="!is_empty"
        hide-details
        readonly
        :placeholder="$t('comp.treeselect_asp.click_to_select')"
        auto-grow
        :rows="1"
        clearable
        :prepend-icon="prependIcon"
        @click:prepend="openDialog"
        @click:clear="clear"
        @click="open_if_empty"
        :value="value_text")
    v-dialog(width="800" v-model="dialogOpen" height="100%")
      TreeleafPicker(
        :tree="tree"
        :attr="attr"
        :data_source="data_source"
        v-model="int_value"
        @clear="clear"
        @selected="selected($event)"
        :disabled="disabled"
        :keep_selection="false")
  div(v-else)
    div {{value_text}}
</template>

<script>
import TreeleafPicker from "../input/TreeleafPicker";
import {flatten_tree_to_options, get_codes_as_tree} from "~/lib/options";
import {EDIT} from "~/lib/consts";
import AspectComponentMixin from "./AspectComponentMixin";
import GeneralSelectMixin from "~/components/aspect_utils/GeneralSelectMixin"
import {unpack} from "~/lib/aspect"
import OptionsMixin from "~/components/aspect_utils/OptionsMixin";
import LanguageCodeFallback from "~/components/aspect_utils/LanguageCodeFallback";
import SelectMixin from "~/components/aspects/SelectMixin";
import TreeSelectComponentMixin from "~/components/aspect_utils/TreeSelectComponentMixin";

/*
the start of a custom value field. but wtf...
      v-row
      v-col.pr-0.pointer(cols=1)
        v-icon {{prependIcon}}
      v-col.pl-0(:cols='is_empty ? "10" : "10"' :style="{'border-bottom': '1px grey solid'}")
        div {{value_text}}
      v-col.pr-0.pointer(col=1 v-if="!is_empty")
        v-icon mdi-close

 */

export default {
  name: "TreeSelectAspect",
  components: {LanguageCodeFallback, TreeleafPicker},
  mixins: [AspectComponentMixin, GeneralSelectMixin, OptionsMixin, SelectMixin, TreeSelectComponentMixin],
  data() {
    return {
      tree: {},
      flat_options: [],
      dialogOpen: false,
      int_value: null
    }
  },
  created() {
    this.int_value = this.value
    this.calc_options()
    if (this.is_editable_mode) {
      if (this.direct_select) {
        let options = {}
        if (this.attr.allow_select_levels) {
          options.include_levels = this.attr.allow_select_levels
        } else {
          options.include_levels = [this.tree.levels.length - 1]
        }
        this.flat_options = this.get_flat_options(options)
      }
      // console.log("created", this.extra, this.value)
      if (this.extra.listitem && this.is_empty) {
        this.dialogOpen = true
      }
    }
  },
  methods: {
    openDialog(short_persistence) {
      if (!this.disabled) {
        this.dialogOpen = true
      }
    },
    auto_select(value) {
      // console.log("autoselect", value)
      const result = this.$_.concat((value.parents || []).map(v => ({value: v, text: v})), {
        value: value.value,
        text: value.value
      })
      this.update_value(result)
    },
    open_if_empty() {
      if (!this.disabled && this.is_empty) {
        this.dialogOpen = true
      }
    },
    selected(val) {
      // console.log("TSA selected", val)
      this.dialogOpen = false;
      if (val) {
        this.update_value(val.value)
      }
    },

    clear() {
      this.update_value([])
      this.dialogOpen = false;
      this.$emit("aspectAction", {action: "clear"})
    }
  },
  computed: {
    is_empty() {
      return this.$_.isEmpty(this.value)
    },
    // int_value: {
    //   get: function () {
    //     return this.value
    //   },
    //   set: function (val) {
    //     // console.log("tsa-val set. update...", val)
    //     this.update_value(val)
    //   }
    // },
    prependIcon() {
      return this.is_view_mode ? '' : 'mdi-file-tree'
    },
    direct_select() {
      if (!this.aspect.attr.hasOwnProperty("direct_select"))
        return true
      else {
        return this.aspect.attr.direct_select
      }
    },
    value_text() {
      // console.log("val text", this.value)
      // console.log("TV", this.value)
      let act_tree_node = this.tree.root
      return this.value.map(v => {
        if (typeof v === "string")
          return v
        act_tree_node = act_tree_node.children.find(node => node.value === v.value)
        let base = act_tree_node.text
        base += v.extra_value ? " / " + unpack(v.extra_value) : ""
        return base
      }).join(" \u21D2 ")
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

.pointer:hover {
  cursor: pointer;
}
</style>
