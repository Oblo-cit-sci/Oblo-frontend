<template lang="pug">
  div
    div
    v-list
      v-list-tile(v-for="(node, index) of selection", :key="node.title")
        v-list-tile-content
          v-list-tile-title {{node.name}}
        v-list-tile-action
          v-btn(icon @click="remove(index)")
            v-icon cancel
    v-divider(v-if="has_both()")
    Selector(:options="act_options" v-on:selection="select" :highlight="false")
</template>

<script>

  /**
   * Tree object should at each level (each node) have a title (or name) and children key.
   *
   */

  import Selector from "./Selector";

  const ld = require('lodash');

  export default {
    name: "TreleafPicker2",
    components: {Selector},
    props: ["tree"],
    data: function () {
      return {
        selection: [], // indices of children
      }
    },
    computed: {
      act_options() {
        let options = [];
        if (this.selection.length === 0) {
          options = this.tree.children;
        } else {
          options = ld.last(this.selection).children || [];
        }
        for (let index in options) {
          let node = options[index];
          node["title"] = node["name"];
          node["id"] = parseInt(index);
        }
        return options;
      }
    },
    methods: {
      select(value) {
        this.selection.push(value);
      },
      remove(index) {
        this.selection = this.selection.slice(0, index);
      },
      has_both() {
        return this.selection.length > 0 && this.act_options.length > 0;
      }
    }
  }
</script>

<style scoped>

</style>
