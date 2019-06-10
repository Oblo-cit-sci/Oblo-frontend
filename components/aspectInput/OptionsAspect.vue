<template lang="pug">
  div
    v-radio-group(v-model="selected_option" row)
      div(v-for="(comp_type, index) in aspect.options" :key="index")
        v-radio(label="non" :value="index")
          template(v-slot:label)
            Aspect(:aspect="comp_type" v-bind:value.sync="opt_values[index]" :edit="true" :extra="extra" :mode="mode")
      // v-bind:value="i_value[index]" v-on:update:value="update_value($event, index)" :edit="true")
</template>

<script>

  // :edit="index === selected_option"

  /*
    this is when there are several input method aspects as options, and the user can choose one
   */

  import AspectMixin from "./AspectMixin"
  import Aspect from "../Aspect"
  import {aspect_wrapped_default_value} from "../../lib/entry"

  export default {
    name: "OptionsAspect",
    components: {Aspect},
    mixins: [AspectMixin],
    data() {
      return {
        title: "XXX",
        selected_option: 0,
        opt_values: []
      }
    },
    created() {
      for (let index in this.aspect.options) {
        this.opt_values[index] = aspect_wrapped_default_value(this.aspect.options[index])
      }
    },
    methods: {
      update_value($event, index) {
        //this.i_value[index] = $event
      }
    },
    watch: {
      selected_option(val) {
        //val = parseInt(val)
        for (let index in this.aspect.options) {
          if (parseInt(index) !== val) {
            this.opt_values[index] = aspect_wrapped_default_value(this.aspect.options[index])
          }
        }
      },
      opt_values(val) {
        this.value_change(this.opt_values[this.selected_option])
      }
    }
  }
</script>

<style scoped>

</style>


CompositeAspect
