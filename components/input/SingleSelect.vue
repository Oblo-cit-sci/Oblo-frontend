<template lang="pug">
  div.pa-0(v-if="view_clearlist")
    div(v-if="no_options") {{$t("comp.select_asp.no_options")}}
    v-list.pa-0(
      v-else
      :three-line="has_some_description"
      dense
      class="singleselect_list"
    )
      div(v-for="(item,index) of options" :key="index")
        v-subheader(v-if="is_category(item)") {{item.text}}
        v-list-item(v-else
          @click="select(item)"
          :disabled="disabled_item(item)"
          :class="{ marked: marked(item.value) }"
          class="single_select")
          v-list-item-avatar(v-if="option_icon(item)")
            v-img(:src="option_icon(item)" contain max-height="40")
          v-icon(v-if="item.mdi_icon") {{item.mdi_icon}}
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
    v-select(outlined single-line
      :hide-details="hide_details"
      :multiple=false
      v-model="selected_item"
      :items="select_options"
      return-object
      :clearable="clearable"
      :placeholder="placeholder"
      :disabled="disabled")
    div(v-if="selected_item")
      div.mt-1(v-if="selected_item.description") {{$t("comp.select_asp.descr")}}: {{selected_item.description}}
      div.mt-1(v-if="value_icon")
        v-img(:src="value_icon" contain max-height="40")
  div(v-else-if="view_autocomplete")
    v-autocomplete(outlined single-line v-model="selected_item" :hide_details="hide_details" :items="options" return-object :clearable="clearable" :placeholder="placeholder" :disabled="disabled" )
  div(v-else-if="view_radiogroup")
    v-radio-group(:row="true"  v-model="selected_item")
      v-radio(v-for="item of options" :key="item.key" :label="item.text" :value="item.value")
  div(v-else-if="view_grid")
    SelectGrid(:options="options" v-on:selection="select($event)")
  div(v-else-if="none")
    div {{$t("comp.select_asp.no_options")}}
</template>

<script>

/*
OPTIONS NEED TO HAVE
text, value
and optional "description"
 */

import SelectGrid from "~/components/aspect_utils/SelectGrid"
import LanguageCodeFallback from "~/components/aspect_utils/LanguageCodeFallback";
import ResponsivenessMixin from "~/components/ResponsivenessMixin";

let select_tresh = 6;
let autocomplet_thresh = 20

const NONE = "none"
const LIST = "list";
const SELECT = "select";
const AUTOCOMPLETE = "autocomplete"

const RADIOGROUP = "radiogroup"
const GRID = "grid"


export default {
  name: "SingleSelect",
  mixins: [ResponsivenessMixin],
  components: {LanguageCodeFallback, SelectGrid},
  props: {
    options: Array,
    selection: [Object, String],
    disabled_options: {
      type: Array,
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
      default: undefined,
      validator: v => [NONE, LIST, SELECT, AUTOCOMPLETE, RADIOGROUP, GRID, undefined].includes(v)
    },
    only_value: {
      type: Boolean
    },
    data_source: {
      type: String
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
      viewStyle: LIST,
      selected_item: null, // for v-select
      radioselect_test: "view",
      emit_only_value: false
    }
  },
  created() {
    // console.log("SingleSelect create", this.selection, this.options)
    this.emit_only_value = this.only_value
    if (this.selection) {
      this.set_selected_item(false)
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
    option_disabled(item){
      console.log("disable?", item)
    },
    select(item) {
      // console.log("selected",item)
      // debugger
      if (this.disabled)
        return
      if (item.value === undefined)
        return;
      if (this.selection && this.selection.value === item.value) {
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
        this.viewStyle = LIST
      } else if (sz < autocomplet_thresh) {
        this.viewStyle = SELECT
      } else {
        this.viewStyle = AUTOCOMPLETE
      }
    },
    marked(key) {
      // console.log("marked?", this.selection, key, this.highlight)
      if (this.selection)
        return key === this.selection.value && this.highlight;
    },
    is_category(item) {
      return item.type === "category"
    },
    emitUp(item) {
      // console.log("emitUp", item)
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
      // console.log("set_selected_item", this.selected_item, this.selection)
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
    disabled_item(item) {
      if(item.disabled) {
        return true
      }
      if (!this.disabled_options) {
        return false
      }
      return this.disabled_options.includes(item.value)
    },
    option_icon(item) {
      // console.log(item,  item.icon)
      if (item.icon) {
        if (this.data_source) {
          return this.$api.entry.url_slug_attachment(this.data_source, item.icon)
        } else {
          return this.$api.static.url(item.icon)
        }
      } else {
        return null
      }
    }
  },
  computed: {
    select_options() {
      return this.options.map(o => Object.assign(o, {disabled: this.disabled_item(o.value)}))
    },
    has_some_description() {
      return this.$_.find(this.options, (o) => o.description && o.description !== "") !== undefined
    },
    view_clearlist() {
      return this.viewStyle === LIST || this.is_xsmall
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
    },
    no_options() {
      return this.options.length === 0
    },
    value_icon() {
      if (this.$_.get(this.selection, "icon")) {
        if (this.data_source) {
          return this.$api.entry.url_slug_attachment(this.data_source, this.selection.icon)
        } else {
          return this.$api.static.url(this.selection.icon)
        }
      }
    },
  },
  watch: {
    options: {
      immediate: true,
      handler() {
        if (this.force_view) {
          this.viewStyle = this.force_view;
          if (this.viewStyle === RADIOGROUP) {
            this.emit_only_value = true
            this.set_selected_item(false)
          }
        } else {
          this.set_view_style()
        }
      }
    },
    selected_item(item) {
      // console.log("selected_item", item?.value,  this.selected_item?.value, this.view_select)
      if(this.view_select) {
        this.emitUp(item)
      } else {
        if (item?.value !== this.selected_item?.value) {
          this.emitUp(item)
        }
      }
    },
    selection() {
      // console.log("selection changed", this.selection)
      this.set_selected_item()
    },
    disabled_options(options) {
      if (this.selected_item)
        if (options.includes(this.selected_item.value)) {
          this.emitUp(null)
        }
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
