<template lang="pug">
  div
    h3  {{aspect.name}}
    v-list(v-if="has_items")
      v-list-tile(v-for="item in i_value", :key="item.slug")
        v-list-tile-content
          v-list-tile-title {{item}}
        v-list-tile-action
          v-btn(icon @click="remove(item)")
            v-icon(color="grey" lighten-1) close
    div(v-if="create")
      v-btn(@click="create_item()") Create
    div(v-if="!create && allow_more") select from
      Selector(v-bind:options="options" v-on:selection="selection")
    div(v-if="!create && !allow_more") maximum reached
</template>

<script>

  import Selector from "../Selector";
  import {create_options} from "../../lib/common"
  import AspectMixin from "./AspectMixin";

  var ld = require('lodash');

  export default {
    name: "ListOf",
    components: {Selector},
    mixins: [AspectMixin],
    data() {
      return {
        given_options: [],
        create: false
      }
    },
    created() {
      this.i_value = [];
      // build the given_options (all options available) from what is passed
      let passed_options = this.aspect.items;
      // a "*" means, lookup code and set the values as options
      if (typeof (passed_options) === "string") {
        let type_char = passed_options.charAt(0);
        if (type_char === "*") {
          passed_options = this.$store.state.codes[passed_options.substring(1)];
          // console.log("taking code for list", given_options.substring(1));
          console.log("code options", passed_options);
        }
        if (type_char === "$") {
          console.log("entry aggregator");
          this.create = true;
          passed_options = [];
        }
      }
      // transform the options into a wellformed object, containing title and slug
      for (let option of passed_options) {
        //console.log("o", option);
        option = create_options(option);
        if (option !== null)
          this.given_options.push(option);
      }
    },
    computed: {
      has_items() {
        return   ld.size(this.i_value) > 0
      },
      options() {
        // filter selected options out
        let options = this.given_options.slice();

        // filter here. could be fiddled in into the conditions... but not clean.
        // remove options already inserted
        let selected_slugs = ld.map(this.i_value, "slug");
        options = options.filter(o => !selected_slugs.includes(o.slug));
        return options //this.aspect.attr.options
      },
      allow_more() {
        if (!this.aspect.attr.hasOwnProperty("max")) {
          return true
        } else {
          return this.i_value.length < this.aspect.attr.max
        }
      }
    },
    methods: {
      selection(item) {
        this.i_value = item;
        this.$emit("update:value", this.i_value);
      },
      remove(item) {
        ld.pull(this.selected, [item]);
        this.i_value.splice(item);
      },
      create_item() {
        // this is when u want to add a village to a site, or household to a village
        let entry_type = this.aspect.items.substring(1);
        this.$emit("create_related", entry_type, this.aspect);
      }
    }
  }
</script>

<style scoped>

</style>
