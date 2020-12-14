<template lang="pug">
  div.pa-0(v-if="view_clearlist")
    v-list.pa-0(
      :three-line="has_some_description"
      dense
      class="singleselect_list"
    )
      div(v-for="(item,index) of options" :key="index")
        v-subheader(v-if="is_category(item)") {{item.text}}
        v-list-item(v-else
          @click="select(item)"
          :disabled="disabled_item(item.value)"
          :class="{ marked: marked(item.value) }"
          class="single_select")
          v-list-item-avatar(v-if="has_some_icons")
            v-img(:src="icon_path(item)"  contain max-height="25")
          v-list-item-content
            v-list-item-title
              span {{item.text}}
              LanguageCodeFallback.ml-2(v-if="alt_lang(item)" :actual_lang="alt_lang(item)" small)
            v-list-item-subtitle {{item.description}}
          v-list-item-action.align-self-center(v-if="action_icon")
            v-spacer
            v-icon {{action_icon}}
        v-divider
  div(v-else-if="view_select")
    v-select(outlined single-line :hide-details="hide_details" :multiple=false v-model="selected_item" :items="select_options" return-object :clearable="clearable" :placeholder="placeholder" :disabled="disabled" )
    div(v-if="selected_item")
      div.mt-1(v-if="selected_item.description") Description: {{selected_item.description}}
      div.mt-1(v-if="has_some_icons")
        v-img(:src="icon_path(selected_item)" contain max-height="40")
  div(v-else-if="view_autocomplete")
    v-autocomplete(outlined single-line v-model="selected_item" :hide_details="hide_details" :items="options" return-object :clearable="clearable" :placeholder="placeholder" :disabled="disabled" )
  div(v-else-if="view_radiogroup")
    v-radio-group(:row="true"  v-model="selected_item")
      v-radio(v-for="item of options" :key="item.key" :label="item.text" :value="item.value")
  div(v-else-if="view_grid")
    SelectGrid(:options="options" v-on:selection="select($event)")
  div(v-else-if="none")
    div Nothing to select from
</template>

<script>

  /*
  OPTIONS NEED TO HAVE
  text, value
  and optional "description"
   */

  import {server_icon_path} from "~/lib/client";
  import SelectGrid from "~/components/aspect_utils/SelectGrid"
  import LanguageCodeFallback from "~/components/aspect_utils/LanguageCodeFallback";

  let select_tresh = 6;
  let autocomplet_thresh = 20

  const NONE = -1
  const CLEAR_LIST = "list";
  const SELECT = "select";
  const AUTOCOMPLETE = "autocomplete"

  const RADIOGROUP = "radiogroup"
  const GRID = "grid"


  export default {
    name: "SingleSelect",
    components: {LanguageCodeFallback, SelectGrid},
    props: {
      options: Array,
      selection: [Object, String],
      disabled_options: {
        type:Array,
        default: () => []
      },
      highlight: {
        type: Boolean,
        default: true
      },
      select_sync: {
        type: Boolean,
        default: true
      },
      force_view: {
        type: String,
        default: undefined
      }, // either (CLEAR_LIST | VUETIFY_SELECT)
      only_value: {
        type: Boolean
      },
      disabled: {
        type: Boolean,
      },
      placeholder: String, // only select
      action_icon: {
        type: String,
        default: null
      },
      clearable: {
        type: Boolean,
        default: true
      },
      hide_details: Boolean
    },
    data() {
      return {
        viewStyle: CLEAR_LIST,
        selected_item: null, // for v-select
        radioselect_test: "view",
        emit_only_value: false
      }
    },
    created() {
      // console.log("Selection create", this.selection)
      this.emit_only_value = this.only_value
      if (this.selection) {
        this.set_selected_item(false)
      }
      if (this.force_view) {
        this.viewStyle = this.force_view;
        if (this.viewStyle === RADIOGROUP) {
          this.emit_only_value = true
          this.set_selected_item(false)
        }
      } else {
        this.set_view_style()
      }
    },
    beforeUpdate() {
      if (!this.force_view) {
        this.set_view_style()
      }
    },
    methods: {
      alt_lang(item) {
        if (item.language) {
          return item.language
        } else {
          return null
        }
      },
      select(item) {
        if (this.disabled)
          return
        if (item.value === undefined)
          return;
        if (this.selection && this.selection.value === item.value && this.clearable) {
          this.emitUp(null)
        } else {
          this.emitUp(item)
        }
      },
      set_view_style() {
        let sz = this.$_.size(this.options)
        if (sz === 0) {
          this.viewStyle = NONE
        } else if (sz < select_tresh) {
          this.viewStyle = CLEAR_LIST
        } else if (sz < autocomplet_thresh) {
          this.viewStyle = SELECT
        } else {
          this.viewStyle = AUTOCOMPLETE
        }
      },
      // todo dont do that. take it from the real server. the last function that usess: server_icon_path
      icon_path(item) {
        return server_icon_path(this.$axios, item.icon)
      },
      marked(key) {
        // console.log(this.selection, key)
        if (this.selection)
          return key === this.selection.value && this.highlight;
      },
      is_category(item) {
        return item.type === "category"
      },
      emitUp(item) {
        //console.log("emitUp", item)
        if (item === undefined)
          item = null
        // todo maybe just one emit?
        // but item might already be string, ...
        const event = this.emit_only_value ?
          ((typeof item === "string" || item === null) ? item : item.value) :
          item
        //console.log("emit", item, this.select_sync)
        if (this.select_sync) {
          this.$emit('update:selection', event) // refactor to use the item
        } else {
          //console.log("emit no sync")
          this.$emit("selection", event)
        }
      },
      set_selected_item() {
        //console.log("set_selected_item", this.selected_item, this.only_value, this.selection)
        if (this.emit_only_value) {
          this.selected_item = this.selection
        } else {
          if (typeof this.selection === "string") {
            this.emit_only_value = true
            this.selected_item = this.$_.find(this.options, (o) => {
              return o.value === this.selection
            })
          } else {
            this.selected_item = this.selection;
          }
        }
      },
      disabled_item(item_value) {
        if(!this.disabled_options) {
          return false
        }
        return this.disabled_options.includes(item_value)
      }
    },
    computed: {
      select_options() {
        return this.options.map(o => Object.assign(o, {disabled: this.disabled_item(o.value)}))
      },
      has_some_description() {
        return this.$_.find(this.options, (o) => o.description && o.description !== "") !== undefined
      },
      has_some_icons() {
        return this.$_.find(this.options, (o) => o.icon && o.icon !== "") !== undefined
      },
      view_clearlist() {
        return this.viewStyle === CLEAR_LIST
      },
      view_select() {
        return this.viewStyle === SELECT
      },
      view_autocomplete() {
        return this.viewStyle === AUTOCOMPLETE
      },
      view_radiogroup() {
        return this.viewStyle === RADIOGROUP
      },
      view_grid() {
        return this.viewStyle === GRID
      },
      none() {
        return this.viewStyle === NONE
      }
    },
    watch: {
      selected_item(item) {
        // console.log("watchers: selected_item", item)
        this.emitUp(item)
      },
      selection(val) {
        this.set_selected_item()
      }
    }
  }
</script>

<style scoped>
  .singleselect_list {
    margin-bottom: 1%;
  }

  .single_select {
    min-height: 35px;
  }

  .marked {
    background: khaki;
  }

  .category {
    background: lightgrey;
    width: 100%;
  }
</style>
