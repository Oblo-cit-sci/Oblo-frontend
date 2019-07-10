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
                v-on:entryAction="$emit('entryAction', $event)")
    div(v-if="value")
      Aspect(
        v-bind:aspect="aspect.view_type"
        :value="result_value"
        :edit="false"
        :extra="extra"
        mode="view"
        v-on:entryAction="$emit('entryAction',$event)")
</template>

<script>


  /*
    this is when there are several input method aspects as options, and the user can choose one
   */

  import AspectMixin from "./AspectMixin"
  import Aspect from "../Aspect"
  import {aspect_raw_default_value, aspect_wrapped_default_value} from "../../lib/entry"
  import {ENTRYACTION, GLOBAL_ASPECT_REF} from "../../lib/consts";

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
      //console.log("opt create", this.value)
      for (let index in this.aspect.options) {
        this.opt_values[index] = aspect_wrapped_default_value(this.aspect.options[index])
      }
      if(this.i_value === null) {
        //console.log("setting i_value to default")
        this.i_value = aspect_raw_default_value(this.aspect.view_type)
        this.value_change(this.i_value)
      }
      //console.log("opt asp init with val", this.value)
    },
    methods: {
      optionUpdate(event, index) {
        //console.log("OP-Asp, update", event, this.selected_option)
        this.opt_values[index] = event
        //console.log(this.opt_values[this.selected_option])
        if (this.opt_values[this.selected_option].value) {
          this.i_value = this.opt_values[this.selected_option].value
          console.log("opt upt", this.i_value, this.value)
          this.value_change(this.i_value)
          return true
        } else {
          return false
        }
      },
      /*check_aspect_action(event) {
        //console.log("opt acpect check action", event)
        if (event.action === GLOBAL_ASPECT_REF) {
          //event.value = this.aspect_ref

          this.$emit(ENTRYACTION, event)
        } else {
          this.$emit(ENTRYACTION, event)
        }
      }*/
    },
    computed: {
      result_value() {
        // TODO some horror that comes cuz in basic Obs.
        // when there is a manual input it causes an emit chain, cuz its default vals
        // that tirggers a mess
        // console.log("res?", this.value, this.i_value)
        try {
          if (this.i_value !== null) {
            return {value: this.i_value}
            /*if(this.value.hasOwnProperty("value") && this.value.value !== null) {
              console.log("OptAsp- value.value")
              return this.value.value*/
          } else {
            return aspect_wrapped_default_value(this.aspect.view_type)
          }
        } catch {
          console.log("OptAsp: crash")
          return aspect_wrapped_default_value(this.aspect.view_type)
        }
        /*
        if (this.value !== null) {
          if (this.value.value !== null) {
            if (typeof (this.value) === "object") {
              console.log("obj down", this.value)
              if (!this.value) {
                console.log("obj val null")
                return aspect_wrapped_default_value(this.aspect.view_type)
              }
            }
            return this.value
          } else {
            console.log("wrapped val")
            return {value: this.value}
          }
        } else {
          console.log("optas. result_value null. viewtype?", this.aspect.view_type)
          return aspect_wrapped_default_value(this.aspect.view_type)
        }
         */
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
        this.optionUpdate()
        this.i_value = this.opt_values[this.selected_option].value
        this.value_change(this.i_value)
        //console.log("sel ch", this.value)
      },
    }
  }
</script>

<style scoped>

</style>

