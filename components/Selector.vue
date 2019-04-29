<template lang="pug">
  div(v-if="viewStyle === CLEAR_LIST")
    v-list(two-line)
      v-list-tile(v-for="item of options"
        :key="item.title" @click="select(item)" v-bind:class="{ marked: marked(item.title) }")
        v-list-tile-content
          v-list-tile-title {{item.title}}
          v-list-tile-sub-title {{item.description}}
  div(v-else-if="viewStyle === VUETIFY_SELECT")
    v-select(chips dense :multiple="multiple" v-model="select_select" :items="simpleOptions")
</template>

<script>


  /*

    pass the options, and a selection which should be synced.
    e.g.
    v-bind:options="input_options" v-bind:selection.sync="selection"

    the options should be objects with a "title", optional "slug" and "description".
    use the function create_option in the common.js to validate

    parent component should have a method: selection

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
    name: "Selector",
    props: {
      options: Array | Object,
      selection: Object,
      highlight: {
        type: Boolean,
        default: true
      },
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: -1
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
        selected: null, // the title for highlighting
        // this is for VUETIFY_SELECT- also see watch...
        select_select: [],
      }
    },
    created() {
      //console.log(this.options);
      this.CLEAR_LIST = CLEAR_LIST;
      this.VUETIFY_SELECT = VUETIFY_SELECT;
      // console.log("Selector, option", this.options);

      if (this.selection === undefined) {
        this.select_sync = false;
      }

      // not used ATM
      if(this.force_view) {
        this.viewStyle = view_map[this.force_view];
        console.log(this.force_view, this.viewStyle);
        if(this.viewStyle === VUETIFY_SELECT)
          this.select_select = [];
      } else {
        if (ld.size(this.options) < clearListThresh) {
          this.viewStyle = CLEAR_LIST;
        } else {
          this.viewStyle = VUETIFY_SELECT;
          this.select_select = []
        }
      }
      // console.log(this.highlight);
      // console.log("selector, sync:" , this.options, this.select_sync, this.viewStyle);
    },
    computed: {
      simpleOptions() {
        return ld.map(this.options, o => o.slug);
      },
      multiple() {
        return this.max !== 1;
      }
    },
    methods: {
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
