<template lang="pug">
  .treeselect
    div
    v-list
      v-list-tile(v-for="(node, index) of selection", :key="node.title")
        v-list-tile-content
          v-list-tile-title {{node.name}}
        v-list-tile-action
          v-btn(icon @click="remove(index)")
            v-icon cancel
    v-divider(v-if="has_both()")
    v-subheader#subheader(v-if="has_level_names") {{act_levelname}}
    SingleSelect(:options="act_options" v-on:selection="select($event)" :select_sync="false" :highlight="false")
    v-btn(v-if="done_available" @click="done" color="success") Done
</template>

<script>

  /**
   * Tree object should at each level (each node) have a title (or name) and children key.
   */

  import SingleSelect from "./SingleSelect";
  import {object_list2options, string_list2options} from "../lib/client";

  const ld = require('lodash');

  export default {
    name: "TreleafPicker",
    components: {SingleSelect, Selector},
    props: ["tree"], // OuterRef is for the LICCI aspect, cuz JS messes up loops and events (always takes the
    data: function () {
      return {
        selection: [], // indices of children
        level_names: false
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

        //options = ld.map(options, (o) => {return o.name})
        console.log("AO", )
        return object_list2options(options, "title", "title"); //string_list2options(options);
      },
      done_available() {
        return ld.size(this.act_options) === 0;
      },
      has_level_names() {
        return this.level_names && ld.size(this.act_options) > 0;
      },
      act_levelname() {
        return this.level_names[this.selection.length]
      }
    },
    created() {
      //console.log("CREATED DIALOG")
      if(this.tree.hasOwnProperty("level_names")) {
        this.level_names = this.tree.level_names;
      }
    },
    methods: {
      select(value) {
        console.log(value)
        this.selection.push(value);
      },
      remove(index) {
        this.selection = this.selection.slice(0, index);
      },
      has_both() {
        return this.selection.length > 0 && this.act_options.length > 0;
      },
      done() {
        this.$emit("selected", ld.last(this.selection));
        this.selection = [];
      }
    }
  }
</script>

<style scoped>

  .treeselect {
    text-transform: none;
    background: white;
  }

  #subheader {
    background: white;
  }
</style>
