<template lang="pug">
  div(v-if="view_clearlist")
    v-list(:three-line="has_some_description")
      v-list-tile(v-for="item of options"
        :key="item.value"
        @click="select(item)"
        :class="[{ marked: marked(item.value) }, {category: is_category(item)}]")
        v-list-tile-avatar(v-if="has_some_icons")
          v-icon {{item.icon}}
        v-list-tile-content
          v-list-tile-title {{item.text}}
          v-list-tile-sub-title {{item.description}}
  div(v-else-if="view_select")
    v-select(outline hideDetails singleLine dense :multiple=false v-model="selected_item" :items="options" return-object)
  div(v-else-if="view_autocomplete")
    v-autocomplete(outline hideDetails singleLine dense v-model="selected_item" :items="options" return-object)
  div(v-else-if="view_radiogroup")
    v-radio-group(:row="true"  v-model="selected_item")
      v-radio(v-for="item of options" :key="item.key" :label="item.text" :value="item.value")
  div(v-else-if="none")
    div Nothing to select from
</template>

<script>

  /*
  OPTIONS NEED TO HAVE
  txt, value
  and optional "description"
   */

  let select_tresh = 5;
  let autocomplet_thresh = 20

  const NONE = -1
  const CLEAR_LIST = 0;
  const SELECT = 1;
  const AUTOCOMPLETE = 2

  const RADIOGROUP = 4

  export const VIEW_OPTIONS = {
    NONE: NONE,
    CLEAR_LIST: CLEAR_LIST,
    SELECT: SELECT,
    AUTOCOMPLETE: AUTOCOMPLETE,
    RADIOGROUP: RADIOGROUP
  }

  export default {
    name: "SingleSelect",
    props: {
      options: Array,
      selection: [Object, String],
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
        type: Boolean,
      },
      disabled: {
        type: Boolean,
      }
    },
    data() {
      return {
        viewStyle: CLEAR_LIST,
        selected_item: null, // for v-select
        view_options: VIEW_OPTIONS,
        radioselect_test: "view"
      }
    },
    created() {
      //console.log("Selection create", this.selection)
      if (this.selection) {
        if(typeof this.selection === "string") {
          this.only_value = true
          this.selected_item = this.$_.find(this.options, (o) => { return o.value === this.selection})
        } else {
          this.selected_item = this.selection;
        }
      }
      if (this.force_view) {
        this.viewStyle = this.view_options[this.force_view];
        if(this.viewStyle === RADIOGROUP) {
          this.only_value = true
          this.selected_item = this.selection
        }
      } else {
        let sz = this.$_.size(this.options)
        if (sz === 0) {
          this.viewStyle = NONE
        } else if (sz < select_tresh) {
          this.viewStyle = CLEAR_LIST
        } else if(sz < autocomplet_thresh) {
          this.viewStyle = SELECT
        } else {
          this.viewStyle = AUTOCOMPLETE
        }
      }
    },
    methods: {
      select(item) {
        if(this.disabled)
          return
        if (item.value === undefined)
          return;
        this.emitUp(item)
      },
      marked(key) {
        if(this.selection)
          return key === this.selection.value && this.highlight;
      },
      is_category(item) {
        return item.type === "category"
      },
      emitUp(item) {
        // todo maybe just one emit?
        // but item might already be string, ...
        const event = this.only_value ? (typeof item === "string" ? item : item.value ): item
        //console.log("emit", item, this.select_sync)
        if (this.select_sync) {
          this.$emit('update:selection', event); // refactor to use the item
        } else {
          //console.log("emit no sync")
          this.$emit("selection", event);
        }
      }
    },
    computed: {
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
      none() {
        return this.viewStyle === NONE
      }
    },
    watch: {
      selected_item(item) {
        this.emitUp(item)
      },

    }
  }
</script>

<style scoped>
  .marked {
    background: khaki;
  }

  .category {
    background: lightgrey;
  }
</style>
