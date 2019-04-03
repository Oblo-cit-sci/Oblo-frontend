<template lang="pug">
  div(v-if="viewStyle === CLEAR_LIST")
    v-list(two-line)
      v-list-tile(v-for="(item, slug) in options" :key="item.title" @click="sellect(item)")
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
    the options should be objects with a "title", optional "slug" and "description"

    parent component should have a method: selection
   */

  var _ = require('lodash');

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

      }
    },
    created() {
      if (this.selection === undefined) {
        this.select_sync = false;
      }
      if (_.size(this.options)  < clearListThresh) {
        this.viewStyle =  CLEAR_LIST;
      } else {
        this.viewStyle =  VUETIFY_SELECT;
        this.select_select = []
      }

      this.CLEAR_LIST = CLEAR_LIST;
      this.VUETIFY_SELECT = VUETIFY_SELECT;
    },
    computed: {
      simpleOptions() {
        return _.map(this.options, o => o.slug);
      }
    },
    methods: {
      sellect(item) {
        if (this.select_sync) {
          this.$emit('update:selection', item.slug);
        } else {
          this.$emit("selection", item);
        }
      }
    }
  }
</script>

<style scoped>

</style>
