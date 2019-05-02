<template lang="pug">
  div(v-if="viewStyle === CLEAR_LIST")
    v-list(two-line)
      v-list-tile(v-for="item of options"
        :key="item.title" @click="select(item)" v-bind:class="{ marked: marked(item.title) }")
        v-list-tile-content
          v-list-tile-title {{item.title}}
          v-list-tile-sub-title {{item.description}}
  div(v-else)
    v-select(chips dense :multiple=false v-model="selected_item" :items="options" :item-text="itemtext")
</template>

<script>

  const ld = require('lodash');

  let clearListThresh = 5;

  let CLEAR_LIST = 0;
  let VUETIFY_SELECT = 1;

  const view_map = {
    "CLEAR_LIST": 0,
    "VUETIFY_SELECT": 1
  };

  export default {
    name: "SingleSelect",
    props: {
      options: Array | Object,
      selection: Object,
      highlight: {
        type: Boolean,
        default: true
      },
      force_view: {
        type: String,
        required: false,
        default: undefined
      } // either (CLEAR_LIST | VUETIFY_SELECT)
    },
    data() {
      return {
        select_sync: true,
        viewStyle: CLEAR_LIST,
        selected_item: null, // the title for highlighting
      }
    },
    created() {
      this.CLEAR_LIST = CLEAR_LIST;
      this.VUETIFY_SELECT = VUETIFY_SELECT;

      if(this.selection) {
        this.selected_item = selection;
      }

      if(this.force_view) {
        this.viewStyle = view_map[this.force_view];
      } else {
        if (ld.size(this.options) < clearListThresh) {
          this.viewStyle = CLEAR_LIST;
        } else {
          this.viewStyle = VUETIFY_SELECT;
        }
      }
    },
    methods: {
      itemtext(license_obj) {
        //console.log("item name for ", license_obj);
        return license_obj.title;
      },
      select(item) {
        // console.log(item);
        if (item.slug && item.slug.startsWith("_"))
          return;
        this.selected = item.title;
        // console.log("select. sync?", this.select_sync);
        if (this.select_sync) {
          this.$emit('update:selection', item); // refactor to use the item
        } else {
          this.$emit("selection", item);
        }
      },
      marked(title) {
        return title === this.selected && this.highlight;
      }
    },
  }
</script>

<style scoped>

</style>
