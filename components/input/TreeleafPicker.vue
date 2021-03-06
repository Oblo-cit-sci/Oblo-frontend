<template lang="pug">
  div
    v-list(v-if="dialog_view && has_selection")
      div.ml-3 {{$t('comp.treeleaf_picker.current')}}
      v-list-item(v-for="(node, index) of value", :key="index")
        v-list-item-content {{levelname(index)}}: {{node.text}}
        v-list-item-action
          v-btn(icon @click="remove(index)")
            v-icon mdi-step-backward
    v-divider.mb-1(v-if="has_both()")
    div(:id="level_start_id(level)" v-for="level in shown_levels")
      div.ml-3.my-3(v-if="is_last_level(level.index)" :style="{color:'red'}") {{error_messages}}
      Title_Description.ml-3(:title="level.title" :description="level.description")
      .px-3(v-if="has_level_options(level.index)")
        SingleSelect.pb-1(v-if="edit_mode_list(level.index)"
          v-bind="select_props(level.index)"
          :selection="level_value(level.index)"
          @update:selection="select(level.index,$event)"
          :force_view="edit_mode_list_force_view(level.index)")
        LargeSelectList(v-if="edit_mode_large_list(level.index)" :selection="level_value(level.index)" v-bind="select_props(level.index)" @selection="select(level.index,$event)" :select_sync="false" :highlight="false")
        SelectGrid(v-if="edit_mode_matrix(level.index)" :selection="level_value(level.index)" v-bind="select_props(level.index)" @selection="select(level.index,$event)")
        Paginated_Select(v-if="edit_mode_paginated(level.index)" v-bind="select_props(level.index)" :edit_mode="level_edit_mode(level.index + 1)" @selection="select(level.index,$event)")
      div.ml-3.my-3(v-if="!has_error && is_last_level(level.index)" :style="{color:'green'}") {{$t("comp.treeselect_asp.selection_acceptable")}}
    div.mx-4(v-if="last_selection_has_extra")
    v-btn(v-if="done_available && dialog_view" @click="done" color="success") {{$t('w.done')}}
</template>

<script>

/**
 * Tree object should at each level (each node) have a title (or name) and children key.
 */

import SingleSelect from "./SingleSelect";
import SelectGrid from "../aspect_utils/SelectGrid";
import Paginated_Select from "../aspect_utils/Paginated_Select";
import Title_Description from "../util/Title_Description"
import LargeSelectList from "~/components/aspect_utils/LargeSelectList"
import {pack_value, unpack} from "~/lib/aspect"
import Aspect from "~/components/Aspect"
import {LIST, SELECT} from "~/lib/consts"

const ld = require("lodash")

const MODE_LIST_LIST = "list.list"
const MODE_LIST_SELECT = "list.select"
const MODE_MATRIX = "matrix"
const MODE_PAGINATED = "paginated"
const MODE_LARGE_LIST = "large_list"


export default {
  name: "TreeleafPicker",
  components: {Aspect, LargeSelectList, Title_Description, Paginated_Select, SelectGrid, SingleSelect},
  props: {
    tree: {
      type: Object
    },
    value: Array,
    // show current selection and done button
    dialog_view: {
      type: Boolean,
      default: true
    },
    attr: {
      type: Object,
      default: () => {
        return {}
      },
      validator: attr => {
        if (attr.tree_select_mode) {
          if (ld.some(attr.tree_select_mode, mode =>
            !["list", MODE_LIST_LIST, MODE_LIST_SELECT, MODE_LARGE_LIST, MODE_MATRIX, MODE_PAGINATED].includes(mode)
          ))
            return false
        }
        return true
      }
    }, // OuterRef is for the LICCI aspect, cuz JS messes up loops and events (always takes the
    // this contains the slug of the code entry, in order to calculate the icon routes
    data_source: String
  },
  data: function () {
    return {
      levels: [],
    }
  },
  computed: {
    show_all_levels() {
      return true
    },
    shown_levels() {
      // if (this.act_level === this.levels.length)
      //   return []
      const max_level = Math.min(this.act_level, this.levels.length - 1)
      // console.log(this.act_level, this.levels.length)
      if (!this.show_all_levels) {
        const levels = [this.levels[max_level]]
        levels[0].index = this.act_level
        return levels
      }
      const levels = []
      for (let l = 0; l <= max_level; l++) {
        levels.push(Object.assign({index: l}, this.levels[l]))
      }
      return levels
    },
    act_level() {
      return this.value ? this.value.length : 0
    },
    done_available() {
      // console.log("done?", this.attr.allow_select_levels, this.act_level, this.act_options)
      // todo not sure about 0, maybe because level is always at least 1.?
      // could be, if allow_select_levels not set, return false...
      const allow_levels = this.attr.allow_select_levels || 0
      if (this.$_.includes(allow_levels, this.act_level)) {
        return true
      }
      return this.$_.size(this.last_level_options) === 0
    },
    last_description() {
      if (this.act_level === 0) {
        return ""
      } else {
        return this.value[this.act_level].description || ""
      }
    },
    has_levels() {
      return this.levels && this.$_.size(this.last_level_options) > 0;
    },
    has_selection() {
      return this.act_level > 0
    },
    last_level_options() {
      return this.level_options(this.act_level)
    },
    // @ deprecated
    last_selection_has_extra() {
      if (this.has_selection && this.value[this.act_level - 1].extra || false) {
        console.warn("last_selection_has_extra returns true, but is depracated. returning false")
        return false
      }
    },
    has_error() {
      if (this.show_dialog)
        return false
      else {
        const allow_levels = this.attr.allow_select_levels || 0
        // console.log("allow_levels", allow_levels, "le", this.value.length, this.$_.includes(allow_levels, this.value.length))
        if (this.$_.includes(allow_levels, this.act_level)) {
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
      if (this.has_error) {
        return this.$t('comp.treeselect_asp.select_another_with_level', {
          level_title: this.tree.levels[this.value.length].text
        })
      }
    },
  },
  created() {
    this.levels = this.tree.levels
  },
  methods: {
    select(level_index, selection) {
      // console.log("TLP", level_index, selection)
      if (this.$_.isEqual(this.level_value(level_index), selection)) {
        return
      }
      let def_value = this.$_.cloneDeep(this.value) || []
      if (selection) {
        let insert_new_value = {
          value: selection.value,
          text: selection.text,
          icon: selection.icon,
          index: this.$_.findIndex(this.level_options(level_index), o => o.value === selection.value)
        }
        if (def_value.length === level_index) {
          this.$emit("input", this.$_.concat(def_value, [insert_new_value]))
        } else {
          def_value[level_index] = insert_new_value
          this.$emit("input", this.$_.slice(def_value, 0, level_index + 1))
          this.scroll_to_level(level_index + 1)
        }
      } else { // clicked clear on select
        const result = this.$_.slice(def_value, 0, level_index)
        this.$emit("input", result)
      }
    },
    // currently not called
    clear() {
      this.$emit('clear')
    },
    level_options(level_index) {
      // console.log("level_options", level_index)
      let options = this.tree.root.children
      let level_i = 0
      for (let val of this.value) {
        if (level_i === level_index) {
          break
        }
        options = this.$_.get(options.find(o => o.value === val.value), "children", [])
        // console.log(level_i, val, options)
        level_i++
      }
      options = this.$_.cloneDeep(options)
      // console.log(options)
      for (let index in options) {
        let node = options[index]
        node["id"] = parseInt(index)
      }
      return options
    },
    has_level_options(level_index) {
      return this.level_options.length > 0
    },
    select_props(level_index) {
      return {
        data_source: this.data_source,
        options: this.level_options(level_index)
      }
    },
    level_value(level_index) {
      if (level_index < this.value.length) {
        return this.value[level_index]
      } else {
        return pack_value()
      }
    },
    levelname(index) {
      if (index >= this.levels.length) {
        console.log("bug/error index access larger than levels", index)
        return ""
      }
      return this.levels[index].text
    },
    edit_mode_list(level_index) {
      return [LIST, MODE_LIST_LIST, MODE_LIST_SELECT].includes(this.level_edit_mode(level_index))
    },
    edit_mode_list_force_view(level_index) {
      if (this.edit_mode_list(level_index)) {
        if (this.level_edit_mode(level_index) === MODE_LIST_LIST) {
          return LIST
        } else if (this.level_edit_mode(level_index) === MODE_LIST_SELECT) {
          return SELECT
        }
      }
      return null
    },
    edit_mode_large_list(level_index) {
      return this.level_edit_mode(level_index) === MODE_LARGE_LIST
    },
    edit_mode_matrix(level_index) {
      return this.level_edit_mode(level_index) === MODE_MATRIX
    },
    edit_mode_paginated(level_index) {
      return this.level_edit_mode(level_index) === MODE_PAGINATED
    },
    remove(index) {
      this.$emit("input", this.value.slice(0, index))
    },
    has_both() {
      return this.has_selection && this.last_level_options.length > 0
    },
    done() {
      this.$emit("selected", pack_value(this.value.map(e => {
        let {text, value, icon} = e
        return {text, value, icon}
      })))
    },
    level_edit_mode(level) {
      if (this.attr.tree_select_mode) {
        console.warn("aspect.attr.tree_select_mode is deprecated. use 'mode' in the levels instead")
        return this.$_.get(this.attr, `tree_select_mode[${level}]`, "list")
      }
      return this.levels[level].mode || "list"
    },
    is_last_level(level_index) {
      return level_index === Math.min(this.act_level, this.levels.length - 1)
    },
    level_start_id(level) {
      return "level_start_id_" + level.index
    },
    scroll_to_level(level) {
      if (level < this.levels.length) {
        // console.log("level_start_id_" + level)
        try {
          setTimeout(() => {
            this.$vuetify.goTo("#level_start_id_" + level, {easing: "easeInCubic", offset: 40, duration: 400})
          }, 50)
        } catch (e) {
          console.error(e)
        }
      }
    }
  },
  watch: {
    act_level(level) {
      this.scroll_to_level(level)
    }
  }
}
</script>

<style scoped>


#subheader {
  background: white;
}
</style>
