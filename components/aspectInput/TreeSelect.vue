<template lang="pug">
    div
      v-flex(xs12 sm12 md12 text-xs-left)
        TextShort(:value="i_value.title" :edit="false")
        v-dialog(width="500" v-model="dialogOpen" lazy=true)
          template(v-slot:activator="{ on }")
            v-btn(color="success" dark v-on="on") Select
          TreleafPicker(:tree="options" v-on:selected="selected")
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import TreleafPicker from "../TreleafPicker";
  import TextShort from "./TextShort";

  export default {
    name: "TreeSelect",
    components: {TextShort, TreleafPicker},
    mixins: [AspectMixin],

    data() {
      return {
        options: {},
        dialogOpen: false
      }
    },

    created() {
      // build the given_options (all options available) from what is passed
      let passed_options = this.aspect.items;
      // a "*" means, lookup code and set the values as options
      if (typeof (passed_options) === "string") {
        let type_char = passed_options.charAt(0);
        //console.log("tree, cja", type_char, )
        if (type_char === "*") {
          this.options = this.$store.state.codes[passed_options.substring(1)];
        }
      }
    },
    methods: {
      selected(val) {
        this.i_value = val;
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
