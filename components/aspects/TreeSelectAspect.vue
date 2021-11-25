<template lang="pug">
  div(v-if="is_editable_mode")
    LanguageCodeFallback.my-1(v-if="!code_entry_language_match" :actual_lang="code_entry_language")
    //div SHOW-AUTO direct_select: {{direct_select}}, is_empty: {{is_empty}}, show_dialog: {{show_dialog}}
    //div &nbsp; ==> {{show_autocomplete}}
    v-autocomplete(v-if="show_autocomplete"
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
    div(v-if="show_textarea")
      v-textarea.treeselect_textarea(
        :flat="!is_empty"
        :solo="!is_empty"
        :hide-details="show_dialog"
        :error="has_error"
        :error-messages="error_messages"
        readonly
        :placeholder="textarea_placeholder"
        auto-grow
        :rows="1"
        clearable
        :prepend-icon="prependIcon"
        @click:prepend="openDialog"
        @click:clear="clear"
        @click="open_if_empty"
        :value="value_text")
        template(v-if="value_icon" v-slot:prepend-inner :style="value_icon_style")
          v-img.value_icon(:src="value_icon" contain max-height="50")
    v-dialog(v-if="show_dialog" width="800" v-model="dialogOpen" height="100%" @click:outside="click_outside")
      .select_dialog
        v-btn(icon small @click="dialogOpen=false")
          v-icon mdi-close
        TreeleafPicker(
          :tree="tree"
          :attr="attr"
          :data_source="data_source"
          v-model="int_value"
          @selected="selected($event)"
          :disabled="disabled")
    TreeleafPicker(v-else
    :tree="tree"
      :dialog_view="false"
      :attr="attr"
      :data_source="data_source"
      v-model="value"
      @selected="selected($event)"
      :disabled="disabled")
  div(v-else)
    div(v-if="value_icon" :style="view_container_style")
      v-img.value_icon( :src="value_icon" contain max-height="50" max-width="70" :style="{flex: '2'}")
      span(:style="{flex: '8'}") {{value_text}}
    div(v-else)
      span(:style="{flex: '8'}") {{value_text}}
</template>

<script>
import TreeleafPicker from "../input/TreeleafPicker";
import {EDIT} from "~/lib/consts";
import AspectComponentMixin from "./AspectComponentMixin";
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
  mixins: [AspectComponentMixin, OptionsMixin, SelectMixin, TreeSelectComponentMixin],
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
        if (this.attr.direct_select_levels) {
          options.include_levels = this.attr.direct_select_levels
        } else if (this.attr.allow_select_levels) {
          options.include_levels = this.attr.allow_select_levels
        } else {
          options.include_levels = [this.tree.levels.length - 1]
        }
        this.flat_options = this.get_flat_options(options)
      }
      // console.log("created", this.extra, this.value)
      if (this.extra.listitem && this.is_empty && !this.direct_select) {
        this.dialogOpen = true
      }
    }
  },
  methods: {
    click_outside() {
      this.update_value([])
      this.$emit("aspectAction", {action: "clear"})
      this.int_value = []
    },
    openDialog() {
      if (!this.disabled) {
        this.dialogOpen = true
      }
    },
    auto_select(value) {
      const result = this.$_.concat((value.parents || []), [value])
      this.update_value(result)
      this.int_value = result
      // if the aspect defines "direct_select_levels" which are different to the "allow_select_levels"
      // (what can be a value), it might end up in an non-acceptable level, so it should go into the tree-leaf-picker
      const should_be_in_level = this.attr.allow_select_levels || [this.tree.levels.length - 1]
      if (!should_be_in_level.includes(result.length)) {
        this.openDialog()
      }
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
      // console.log("tree-sel clear")
      this.update_value([])
      this.dialogOpen = false;
      this.$emit("aspectAction", {action: "clear"})
      this.int_value = []
    }
  },
  computed: {
    view_container_style() {
      return {
        display: "inline-flex",
      }
    },
    show_autocomplete() {
      return this.direct_select && this.is_empty && this.show_dialog
    },
    show_textarea() {
      return (!this.direct_select || !this.is_empty)
    },
    /**
     * show error if the current level is not allowed
     * only possible without dialog
     *
     */
    has_error() {
      if (this.show_dialog)
        return false
      else {
        // taken from TreeleafPicker
        const allow_levels = this.attr.allow_select_levels || 0
        // console.log(allow_levels, this.value.length, this.$_.includes(allow_levels, this.value.length))
        if (this.$_.includes(allow_levels, this.value.length)) {
          return false
        }
        let options = this.tree.root.children
        for (let val of this.value) {
          options = this.$_.get(options.find(o => o.value === val.value), "children", [])
        }
        options = this.$_.cloneDeep(options)
        for (let index in options) {
          let node = options[index]
          node["id"] = parseInt(index)
        }
        // console.log("options", this.$_.size(options), this.$_.size(options) !== 0)
        return this.$_.size(options) !== 0
      }
    },
    error_messages() {
      if (this.has_error && this.value.length > 0) {
        return this.$t('comp.treeselect_asp.select_another_value')
      }
    },
    textarea_placeholder() {
      if (this.show_dialog) {
        return this.$t('comp.treeselect_asp.click_to_select')
      } else {
        return ""
      }
    },
    show_dialog() {
      return this.$_.get(this.attr, "show_dialog", true)
    },
    is_empty() {
      return this.$_.isEmpty(this.value)
    },
    // value_icon_style() {
    //   return {
    //     width: "70px",
    //     transform: "translateY(-10px)"
    //   }
    // },
    value_icon() {
      if (!this.is_empty) {
        const icon_values = this.value.filter(v => v.icon)
        if (!this.$_.isEmpty(icon_values)) {
          const last_icon = this.$_.last(icon_values).icon
          return this.$api.entry.url_slug_attachment(this.data_source, last_icon)
        }
      }
    },
    prependIcon() {
      return (this.is_view_mode || !this.show_dialog) ? '' : 'mdi-file-tree'
    },
    direct_select() {
      return this.$_.get(this.attr, "direct_select", true)
    },
    value_text() {
      // console.log("tree-val text", this.value)
      let act_tree_node = this.tree.root
      // console.log("ATN",act_tree_node, this.value)
      return this.value.map(v => {
        // console.log("v?",v, act_tree_node.children)
        if (typeof v === "string")
          return v
        act_tree_node = act_tree_node.children.find(node => node.value === v.value) || act_tree_node
        if (!act_tree_node) {
          console.error("No tree-node", v, node.children)
          return v.text || ""
        } else {
          // console.log("->", act_tree_node.value, act_tree_node.text)
          let base = act_tree_node.text
          base += v.extra_value ? " / " + unpack(v.extra_value) : ""
          return base
        }
      }).join(" \u21D2 ")
    }
  },
  watch: {
    dialogOpen(open) {
      if (!open) {
        if (!this.$_.isEqual(this.int_value, this.value)) {
          this.int_value = this.value
        }
      }
    },
    mode(new_mode) {
      if (new_mode === EDIT && this.$_.isEmpty(this.tree)) {
        this.calc_options()
      }
    }
  }
}
</script>

<style scoped>

/*.pointer:hover {*/
/*  cursor: pointer;*/
/*}*/

.select_dialog {
  text-transform: none;
  background: white;
}
</style>
