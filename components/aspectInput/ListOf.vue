<template lang="pug">
  div select liccis {{aspect}}
    v-list
      v-list-tile(v-for="item in selected", :key="item.slug")
        v-list-tile-content
          v-list-tile-title {{item.title}}
        v-list-tile-action
          v-btn(icon @click="remove(item)")
            v-icon(color="grey" lighten-1) close

    div(v-if="allow_more") select from
      Selector(v-bind:options="options" v-on:selection="selection")
    div(v-else) maximum reached
</template>

<script>

  import Selector from "../Selector";

  var _ = require('lodash');

  export default {
    name: "ListOf",
    components: {Selector},
    props: ["aspect"],
    data() {
      return {
        selected: [],
        given_options: []
      }
    },
    created() {
      console.log(this.aspect);

      let passed_options = this.aspect.attr.options;

      if (typeof (passed_options) === "string") {
        if (passed_options.charAt(0) === "*") {
          passed_options = this.$store.state.codes[passed_options.substring(1)];
          // console.log("taking code for list", given_options.substring(1));
          console.log("code options", passed_options);
        }
      }

      for (let option of passed_options) {
        console.log("o", option);
        let optionType = typeof (option);
        if (optionType === "string") {
          this.given_options.push({
            title: option,
            slug: option
          });
        } else if (optionType === "object") {
          if (!optionType.hasOwnProperty("title")) {
            console.log("OPTIONS ARE MALFORME. MISSING TITLE:", option);
          } else {
            if (!optionType.hasOwnProperty("slug")) {
              option.slug = option.title;
            }
          }
          this.given_options.push(option);
        } else {
          console.log("OPTIONS ARE MALFORME. WRONG TYPE:", option, optionType);
        }
      }

    },
    computed: {
      options() {

        let options = this.given_options.slice();

        // filter here. could be fiddled in into the conditions... but not clean.
        // remove options already inserted
        let selected_slugs = _.map(this.selected, "slug");
        options = options.filter(o => !selected_slugs.includes(o.slug));
        return options //this.aspect.attr.options
      },
      allow_more() {
        if (!this.aspect.attr.hasOwnProperty("max")) {
          return true
        } else {
          return this.selected.length < this.aspect.attr.max
        }
      }
    },
    methods: {
      selection(item) {
        this.selected.push(item)
      },
      remove(item) {
        console.log(item);
        _.pull(this.selected, [item]);
        this.selected.splice(item);
      }
    }
  }
</script>

<style scoped>

</style>
