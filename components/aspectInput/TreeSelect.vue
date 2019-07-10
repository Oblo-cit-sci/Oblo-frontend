<template lang="pug">
    div
      v-flex(text-xs-left)
        TextShort(
          :aspect="text_repr_aspect"
          :value="i_value"
          :edit="false"
          :prependIcon="prependIcon"
          :disabled="disabled"
          v-on:clickPrepend="openDialog()"
          v-on:focus="openDialog(true)")
        v-dialog(width="500" v-model="dialogOpen" lazy=true :persistent="persistent")
          TreleafPicker(
            :tree="options"
            v-on:selected="selected"
            :disabled="disabled"
            :keep_selection="true")
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import TreleafPicker from "../TreleafPicker";
  import TextShort from "./TextShort";
  import {EDIT} from "../../lib/consts";

  export default {
    name: "TreeSelect",
    components: {TextShort, TreleafPicker},
    mixins: [AspectMixin],
    data() {
      return {
        options: {},
        dialogOpen: false,
        persistent: false,
        text_repr_aspect : {
          name: "selected",
          type: "str",
          attr: {
            max: 60
          }
        }
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
      //console.log("tree options", this.options)
    },
    methods: {
      openDialog(short_persistence) {
        if(!this.disabled) {
          this.dialogOpen = true
          // to fix issue of blue triggering a close of the dialog
          if(short_persistence) {
            this.persistent = true
            setTimeout(() => this.persistent = false, 100)
          }
        }
      },
      selected(val) {
        console.log("selected")
        this.dialogOpen = false;
        this.i_value = val.value
        this.value_change(this.i_value)
      }
    },
    computed: {
      prependIcon(){
        return this.mode === EDIT ? 'add' : ''
      }
    }
  }
</script>

<style scoped>


</style>
