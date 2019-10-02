<template lang="pug">
    div
      v-flex(text-xs-left)
        v-autocomplete(
          outline
          single-line
          :disabled="disabled"
          :items="flat_options"
          v-model="i_value"
          @change="emit"
          :aspect_loc="aspect_loc"
          :prependIcon="prependIcon"
          @click:prepend="openDialog()")
        v-dialog(width="500" v-model="dialogOpen" lazy=true)
          TreleafPicker(
            :tree="options"
            v-on:selected="selected"
            :disabled="disabled"
            :keep_selection="true")
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import TreleafPicker from "../TreleafPicker";
  import TextShort from "./TextShortAspect";
  import {EDIT} from "../../lib/consts";
  import {flatten_tree_to_options} from "../../lib/client";

  export default {
    name: "TreeSelectAspect",
    components: {TextShort, TreleafPicker},
    mixins: [AspectMixin],
    data() {
      return {
        options: {},
        flat_options: [],
        dialogOpen: false,
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
      // flat_options // TODO maybe store them...
      this.flat_options = flatten_tree_to_options(this.options)
      //console.log("flat options", this.flat_options)
      //console.log("tree options", this.options)
    },
    methods: {
      openDialog(short_persistence) {
        if(!this.disabled) {
          this.dialogOpen = true
        }
      },
      selected(val) {
        this.dialogOpen = false;
        this.i_value = val.value
        this.emit()
      },
      emit() {
        this.value_change(this.i_value)
      }
    },
    computed: {
      prependIcon(){
        return this.edit ? 'add' : ''
      }
    }
  }
</script>

<style scoped>


</style>
