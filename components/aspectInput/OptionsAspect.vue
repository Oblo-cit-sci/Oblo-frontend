<template lang="pug">
  div
    div(v-if="edit")
      v-radio-group(v-model="selected_option" row)
        div(v-for="(comp_type, index) in aspect.options" :key="index")
          v-radio(label="non" :value="index")
            template(v-slot:label)
              Aspect(
                v-bind:aspect="comp_type"
                v-bind:value="opt_values[index]"
                v-on:update:value="optionUpdate($event, index)"
                :edit="true"
                :extra="extra"
                :mode="mode"
                v-on:entryAction="$emit('entryAction',$event)")
    div(v-else)
      Aspect(
        v-bind:aspect="aspect.view_type"
        v-bind:value="value"
        :edit="false"
        :extra="extra"
        :mode="mode"
        v-on:entryAction="$emit('entryAction',$event)")
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
      optionUpdate(event, index) {
        //console.log("OP-Asp, update", event)
        this.opt_values[index] = event
        this.i_value = this.opt_values[this.selected_option]
        this.value_change(this.i_value)
      }
    },
    watch: {
      selected_option(val) {
        //console.log("option selected", val)
        //val = parseInt(val)
        for (let index in this.aspect.options) {
          if (parseInt(index) !== val) {
            this.opt_values[index] = aspect_wrapped_default_value(this.aspect.options[index])
          } else {
            // would be default...
          }
        }
      },

    }
  }
</script>

<style scoped>

</style>


CompositeAspect
