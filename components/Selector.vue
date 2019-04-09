<template lang="pug">
  div(v-if="viewStyle === CLEAR_LIST")
    v-list(two-line)
      v-list-tile(v-for="item in options"
        :key="item.title" @click="select(item)" v-bind:class="{ marked: marked(item.title) }")
        v-list-tile-content
          v-list-tile-title {{item.title}}
          v-list-tile-sub-title {{item.description}}
  div(v-else-if="viewStyle === VUETIFY_SELECT")
    v-select(chips dense multiple v-model="select_select" :items="simpleOptions")
</template>

<script>

  /*

    pass the options, and a selection which should be synced.
    e.g.
    v-bind:options="input_options" v-bind:selection.sync="selection"

    the options should be objects with a "title", optional "slug" and "description".
    use the function create_option in the common.js

    parent component should have a method: selection
   */

  const ld = require('lodash');

  let clearListThresh = 10;

  let CLEAR_LIST = 0;
  let VUETIFY_SELECT = 1;

  export default {
    name: "Selector",
    props: ["options", "selection"],
    data() {
      return {
        select_sync: true,
        viewStyle: CLEAR_LIST,
        selected: null, // the title for highlighting
        // this is for VUETIFY_SELECT- also see watch...
        select_select: []
      }
    },
    created() {
      this.CLEAR_LIST = CLEAR_LIST;
      this.VUETIFY_SELECT = VUETIFY_SELECT;
      // console.log("Selector, option", this.options);

      if (this.selection === undefined) {
        this.select_sync = false;
      }

      if (ld.size(this.options)  < clearListThresh) {
        this.viewStyle =  CLEAR_LIST;
      } else {
        this.viewStyle =  VUETIFY_SELECT;
        this.select_select = []
      }
      // console.log("selector, sync:" , this.options, this.select_sync, this.viewStyle);
    },
    computed: {
      simpleOptions() {
        return _.map(this.options, o => o.slug);
      }
    },
    methods: {
      select(item) {
        this.selected = item.title;
        // console.log("select. sync?", this.select_sync);
        if (this.select_sync) {
          this.$emit('update:selection', item); // refactor to use the item
        } else {
          this.$emit("selection", item);
        }
      },
      marked(title) {
        return title === this.selected
      }
    },
    watch: {
      select_select(new_val, old_val) {
        this.$emit("selection", new_val);
      }
    }
  }
</script>

<style scoped>
  .marked {
    background: blueviolet;
  }
</style>
