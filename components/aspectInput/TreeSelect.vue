<template lang="pug">
    div
      h3 {{aspect.name}}
      v-flex(xs12 sm12 md12 text-xs-left)
        v-chip(v-for="tag in selection" :key="tag.id" @click="tag_select(tag)") {{tag.title}}
        v-btn(flat icon)
          v-icon add
      v-dialog(width="500" v-model="dialogOpen" lazy=true)
        template(v-slot:activator="{ on }")
          v-btn(color="red lighten-2" dark v-on="on") Add driver
        TreleafPicker(:tree="options" v-on:selected="selected")
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import TreleafPicker from "../TreleafPicker";

  export default {
    name: "TreeSelect",
    components: {TreleafPicker},
    mixins: [AspectMixin],

    data() {
      return {
        options: {},
        selection: [],
        dialogOpen: false
      }
    },

    created() {
      // build the given_options (all options available) from what is passed
      let passed_options = this.aspect.items;
      // a "*" means, lookup code and set the values as options
      if (typeof (passed_options) === "string") {
        let type_char = passed_options.charAt(0);
        console.log("tree, cja", type_char, )
        if (type_char === "*") {
          this.options = this.$store.state.codes[passed_options.substring(1)];
        }
      }
    },
    methods: {
      selected(val) {
        console.log("tree select", val);
        this.selection.push(val);
        this.dialogOpen = false;
      },
      tag_select(sel) {
        console.log("tag:", sel)
      }
    }
  }
</script>

<style scoped>


</style>
