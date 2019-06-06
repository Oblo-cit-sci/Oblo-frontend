<template lang="pug">
  div(v-if="viewStyle === CLEAR_LIST")
    v-list(two-line)
      v-list-tile(v-for="item of options"
        :key="item.value" @click="select(item)" v-bind:class="{ marked: marked(item.value) }")
        v-list-tile-content
          v-list-tile-title {{item.text}}
          v-list-tile-sub-title {{item.description}}
  div(v-else)
    v-select(chips dense :multiple=false v-model="selected_item" :items="options" return-object)
</template>

<script>

  /*
  OPTIONS NEED TO HAVE
  title, key
  and optional "description"
   */

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
      }
    },
    created() {
      this.CLEAR_LIST = CLEAR_LIST;
      this.VUETIFY_SELECT = VUETIFY_SELECT;
      console.log("SingleSelect created", this.selection)
      // TODO check if still needed
      if (this.selection) {
        this.selected_item = this.selection;
      }

      if (this.force_view) {
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
      emitUp(item) {
        if (this.select_sync) {
          this.$emit('update:selection', item); // refactor to use the item
        } else {
          this.$emit("selection", item);
        }
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
</style>
