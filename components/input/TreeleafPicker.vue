<template lang="pug">
  .treeselect
    div(comment="only in dialog")
      v-btn(icon small @click="clear")
        v-icon mdi-close
    v-list(v-if="has_selection")
      div.ml-3 Current selection
      v-list-item(v-for="(node, index) of value", :key="index")
        v-list-item-content
          v-list-item-title {{levelname(index)}}: {{node.text}} {{extra_text(node)}}
        v-list-item-action
          v-btn(icon @click="remove(index)")
            v-icon mdi-step-backward
    v-divider.mb-1(v-if="has_both()")
    Title_Description.ml-3(v-if="has_levels" :title="act_levelname" :description="act_level_description" mode="edit")
    TextShort(:aspect="{'name':'nooo', 'type':'str', 'attr': {}}" mvalue="{value:'cool'}")
    div(v-if="has_options")
      SingleSelect.pb-1(v-if="edit_mode_list" :options="act_options" v-on:selection="select($event)" :select_sync="false" :highlight="false")
      LargeSelectList(v-if="edit_mode_large_list" :options="act_options" v-on:selection="select($event)" :select_sync="false" :highlight="false" :data_source="data_source")
      SelectGrid(v-if="edit_mode_matrix" :options="act_options" v-on:selection="select($event)" :data_source="data_source")
      Paginated_Select(v-if="edit_mode_paginated" :options="act_options" :edit_mode="level_edit_mode(act_level + 1)" v-on:selection="select($event)")
    div.mx-4(v-if="last_selection_has_extra")
      Aspect(v-if="extra_aspect" :aspect="extra_aspect" :ext_value.sync="extra_value" mode="edit")
    .ml-3(v-if="last_description")
      div Description:
      div {{last_description}}
    v-btn(v-if="done_available" @click="done" color="success") Done
</template>

<script>

  /**
   * Tree object should at each level (each node) have a title (or name) and children key.
   */

  import SingleSelect from "./SingleSelect";
  import TextShort from "../aspects/TextShortAspect";
  import {object_list2options} from "~/lib/options";
  import SelectGrid from "../aspect_utils/SelectGrid";
  import Paginated_Select from "../aspect_utils/Paginated_Select";
  import Title_Description from "../util/Title_Description"
  import LargeSelectList from "~/components/aspect_utils/LargeSelectList"
  import {pack_value, unpack} from "~/lib/aspect"
  import Aspect from "~/components/Aspect"


  export default {
    name: "TreeleafPicker",
    components: {Aspect, LargeSelectList, Title_Description, Paginated_Select, SelectGrid, TextShort, SingleSelect},
    props: {
      tree: {
        type: Object
      },
      value: Array,
      extra_value_name: {
        type: String
      },
      keep_selection: {
        type: Boolean,
        default: false
      },
      attr: {
        type: Object,
        default: () => {
          return {}
        }
      }, // OuterRef is for the LICCI aspect, cuz JS messes up loops and events (always takes the
      // this contains the slug of the code entry, in order to calculate the icon routes
      data_source: String
    },
    data: function () {
      return {
        // selection: [], // indices of children
        levels: false,
      }
    },
    computed: {
      select_length() {
        return this.value ? this.value.length : 0
      },
      extra_value: {
        get: function () {
          return this.value[this.value.length - 1].extra_value || ""
        },
        set: function (val) {
          this.value[this.value.length - 1].extra_value = val
        }
      },
      act_options() {
        let options = this.tree.root.children
        // console.log("opt", options)
        // console.log(this.value)
        for (let val of this.value) {
          // console.log("a val", val)
          options = options.find(o => o.name === val.value).children || []
        }
        options = this.$_.cloneDeep(options)
        // console.log("opt", options)
        for (let index in options) {
          let node = options[index]
          node["title"] = node["name"]
          node["id"] = parseInt(index)
        }
        return object_list2options(options, "title", "title")
      },
      done_available() {
        // console.log("done?", this.attr.allow_select_levels, this.act_level)
        if (this.attr.hasOwnProperty("allow_select_levels")) {
          return (this.$_.includes(this.attr.allow_select_levels, this.act_level))
        } else {
          return this.$_.size(this.act_options) === 0
        }
      },
      last_description() {
        if (this.select_length === 0) {
          return ""
        } else {
          return this.value[this.act_level - 1].description || ""
        }
      },
      has_levels() {
        return this.levels && this.$_.size(this.act_options) > 0;
      },
      has_selection() {
        // debugger
        return this.select_length > 0
      },
      act_level() {
        return this.select_length
      },
      has_options() {
        return this.act_options.length > 0
      },
      last_selection_has_extra() {
        return this.has_selection && this.value[this.select_length - 1].extra || false
      },
      extra_aspect() {
        if (this.last_selection_has_extra) {
          const last_extra = this.value[this.select_length - 1].extra
          if (last_extra.type === "text") {
            return {
              name: last_extra.name,
              type: "str",
              attr: {
                max: 90
              }
            }
          } else {
            return null
          }
        }
      },
      act_levelname() {
        // console.log("act_levelname", this.select_length)
        return this.levelname(this.select_length)
      },
      act_level_description() {
        // console.log("act_level_description")
        if (typeof this.levels[this.select_length] === "string") {
          return null
        } else {
          return this.levels[this.select_length].description
        }
      },
      act_edit_mode() {
        return this.level_edit_mode(this.act_level)
      },
      edit_mode_list() {
        return this.act_edit_mode === "list"
      },
      edit_mode_large_list() {
        return this.act_edit_mode === "large_list"
      },
      edit_mode_matrix() {
        return this.act_edit_mode === "matrix"
      },
      edit_mode_paginated() {
        return this.act_edit_mode === "paginated"
      }
    },
    created() {
      if (this.tree.hasOwnProperty("level_names")) {
        console.log("attribute level_names is depracated, use levels")
        this.levels = this.tree.level_names;
      } else if (this.tree.hasOwnProperty("levels")) {
        this.levels = this.tree.levels
      }
    },
    methods: {
      select(value) {
        this.$emit("input", this.$_.concat(this.value || [], [value]))
      },
      clear() {
        this.$emit('clear')
      },
      extra_text(node) {
        return node.extra_value ? ' / ' + unpack(node.extra_value.value) : ''
      },
      levelname(index) {
        if (index >= this.levels.length) {
          console.log("bug/error index access larger than levels", index)
          return ""
        }
        if (typeof this.levels[index] === "string") {
          console.log("levels structure depracated. use an object, with name key")
          return this.levels[index]
        }
        console.log("levelname", index, this.levels)
        return this.levels[index].name
      },
      remove(index) {
        this.$emit("input", this.value.slice(0, index))
      },
      has_both() {
        return this.has_selection && this.act_options.length > 0
      },
      done() {
        // todo do better js :/
        this.$emit("selected", pack_value(this.value.map(e => {
          return {text: e.text, value: e.value, extra_value: e.extra_value}
        })))
      },
      level_edit_mode(level) {
        return this.$_.get(this.attr, `edit[${level}]`, "list")
      },
    }
  }
</script>

<style scoped>

  .treeselect {
    text-transform: none;
    background: white;
  }

  #subheader {
    background: white;
  }
</style>
