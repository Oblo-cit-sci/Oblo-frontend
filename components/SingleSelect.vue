<template lang="pug">
  div(v-if="viewStyle === view_map.CLEAR_LIST")
    v-list(:two-line="has_some_description")
      v-list-tile(v-for="item of options"
        :key="item.value"
        @click="select(item)"
        :class="[{ marked: marked(item.value) }, {category: is_category(item)}]")
        v-list-tile-content
          v-list-tile-title {{item.text}}
          v-list-tile-sub-title {{item.description}}
  div(v-else-if="viewStyle === view_map.VUETIFY_SELECT")
    v-select(outline hideDetails singleLine dense :multiple=false v-model="selected_item" :items="options" return-object)
  div(v-else)
    v-autocomplete(outline hideDetails singleLine dense v-model="selected_item" :items="options" return-object)
</template>

<script>

  /*
  OPTIONS NEED TO HAVE
  title, value
  and optional "description"
   */

  const ld = require('lodash');

  let select_tresh = 5;
  let autocomplet_thresh = 20

  let CLEAR_LIST = 0;
  let VUETIFY_SELECT = 1;
  let AUTOCOMPLETE = 2

  const view_map = {
    "CLEAR_LIST": CLEAR_LIST,
    "VUETIFY_SELECT": VUETIFY_SELECT,
    "AUTOCOMPLETE":AUTOCOMPLETE
  };

  export default {
    name: "SingleSelect",
    props: {
      options: Array,
      selection: Object,
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
        required: false,
        default: undefined
      }, // either (CLEAR_LIST | VUETIFY_SELECT)
      disabled: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        viewStyle: CLEAR_LIST,
        selected_item: null, // for v-select
        simple_select: "b", // TEST SIMPLE
        view_map: view_map
      }
    },
    created() {
      // TODO check if still needed
      if (this.selection) {
        this.selected_item = this.selection;
      }
      if (this.force_view) {
        this.viewStyle = view_map[this.force_view];
      } else {
        let sz = ld.size(this.options)
        if (sz < select_tresh) {
          this.viewStyle = CLEAR_LIST;
        } else if(sz < autocomplet_thresh) {
          this.viewStyle = VUETIFY_SELECT;
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
        //console.log("emit", item, this.select_sync)
        if (this.select_sync) {
          this.$emit('update:selection', item); // refactor to use the item
        } else {
          //console.log("emit no sync")
          this.$emit("selection", item);
        }
      }
    },
    computed: {
      has_some_description() {
        return this.$_.find(this.options, (o) => o.description && o.description !== "") !== undefined
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
