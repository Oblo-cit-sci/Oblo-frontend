<template lang="pug">
  .treeselect
    div
      v-btn(icon small @click="$emit('selected', null)")
        v-icon mdi-close
    v-list(v-if="has_selection")
      div.ml-3 Current selection
      v-list-item(v-for="(node, index) of selection", :key="index")
        v-list-item-content
          v-list-item-title {{levelname(index)}}: {{node.name}}
        v-list-item-action
          v-btn(icon @click="remove(index)")
            v-icon mdi-close-circle-outline
    v-divider.mb-1(v-if="has_both()")
    Title_Description.ml-3(v-if="has_levels" :title="act_levelname" :description="act_level_description" mode="edit")
    div(v-if="has_options")
      SingleSelect.pb-1(v-if="edit_mode_list" :options="act_options" v-on:selection="select($event)" :select_sync="false" :highlight="false")
      LargeSelectList(v-if="edit_mode_large_list" :options="act_options" v-on:selection="select($event)" :select_sync="false" :highlight="false")
      SelectGrid(v-if="edit_mode_matrix" :options="act_options" v-on:selection="select($event)")
      Paginated_Select(v-if="edit_mode_paginated" :options="act_options" :edit_mode="level_edit_mode(act_level + 1)" v-on:selection="select($event)")
    .ml-3(v-if="last_description")
      div Description:
      div {{last_description}}
    v-btn(v-if="done_available" @click="done" color="success") Done
    div(v-if="allows_extra")
      TextShort(v-bind:aspect="extra_value_aspect" :edit="true" v-bind:value.sync="extra_value")
      v-btn(:disabled="extra_value === ''" @click="done_extra" color="warning") Use {{extra_value_name}}
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
  import Title_Description from "../Title_Description"
  import LargeSelectList from "~/components/aspect_utils/LargeSelectList"


  export default {
    name: "TreleafPicker",
    components: {LargeSelectList, Title_Description, Paginated_Select, SelectGrid, TextShort, SingleSelect},
    props: {
      tree: {
        type: Object
      },
      // refactor, its basically another aspect
      allows_extra: {
        type: [Boolean, Number],
      },
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
      } // OuterRef is for the LICCI aspect, cuz JS messes up loops and events (always takes the
    },
    data: function () {
      return {
        selection: [], // indices of children
        levels: false,
        extra_value: []
      }
    },
    computed: {
      act_options() {
        let options = []
        if (this.selection.length === 0) {
          options = this.tree.root.children
        } else {
          options = this.$_.last(this.selection).children || []
        }
        for (let index in options) {
          let node = options[index]
          node["title"] = node["name"]
          node["id"] = parseInt(index)
        }
        return object_list2options(options, "title", "title")
      },
      done_available() {
        console.log("done?", this.attr.allow_select_levels, this.act_level)
        if (this.attr.hasOwnProperty("allow_select_levels")) {
          return (this.$_.includes(this.attr.allow_select_levels, this.act_level))
        } else {
          return this.$_.size(this.act_options) === 0
        }
      },
      last_description() {
        if (this.selection.length === 0) {
          return ""
        } else {
          return this.selection[this.act_level - 1].description || ""
        }
      },
      has_levels() {
        return this.levels && this.$_.size(this.act_options) > 0;
      },
      has_selection() {
        return this.selection.length > 0
      },
      act_level() {
        return this.selection.length
      },
      has_options() {
        return this.act_options.length > 0
      },
      act_levelname() {
        return this.levelname(this.selection.length)
      },
      act_level_description() {
        console.log("act_level_description")
        if (typeof this.levels[this.selection.length] === "string") {
          return null
        } else {
          return this.levels[this.selection.length].description
        }
      },
      extra_value_aspect() {
        return {
          attr: {max: 40},
          description: "",
          name: this.extra_value_name,
          required: true,
          type: "str"
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
        console.log("select", value)
        this.selection.push(value)
      },
      levelname(index) {
        if (typeof this.levels[index] === "string") {
          console.log("levels structure depracated. use an object, with name key")
          return this.levels[index]
        }
        return this.levels[index].name
      },
      remove(index) {
        this.selection = this.selection.slice(0, index)
      },
      has_both() {
        return this.selection.length > 0 && this.act_options.length > 0
      },
      done() {
        this.$emit("selected", this.$_.last(this.selection))
        if (!this.keep_selection)
          this.selection = [];
      },
      done_extra() {
        this.$emit("selected", {
            name: this.extra_value,
            id: 0 // TODO, is that ok?
          }
        )
        this.extra_value = ""
        this.selection = []
      },
      level_edit_mode(level) {
        return this.$_.get(this.attr, `edit[${level}]`, "list")
      }
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
