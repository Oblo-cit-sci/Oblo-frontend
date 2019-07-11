<template lang="pug">
  div
    div(v-for="(comp_type, index) in aspect.components" :key="index")
      Aspect(
        :aspect="comp_type"
        :value="i_value[index]"
        v-on:update:value="update_value($event, index)"
        :edit="true"
        :mode="mode"
        :disabled="disabled"
        :extra="comp_extras(comp_type)"
        v-on:entryAction="$emit('entryAction',$event)"
        v-on:aspectAction="aspectAction")
</template>

<script>

  /*
    the trial to allow 2 (or maybe more aspects into one row: e.g. lon:lat, key:value.
    doesnt stack, when rows get to narrow... :/
      div
      v-layout
        v-flex(col-md6 v-for="(comp_type, index) in aspect.components" :key="index")
          Aspect(
            style="min-width='100px'"
            :aspect="comp_type"
            :value="i_value[index]"
            v-on:update:value="update_value($event, index)"
            :edit="true"
            :mode="mode"
            :extra="comp_extras(comp_type)"
            v-on:entryAction="$emit('entryAction',$event)"
            v-on:aspectAction="aspectAction")
   */

  import AspectMixin from "./AspectMixin";
  import Aspect from "../Aspect";
  import {ASPECTACTION, TITLE_UPDATE} from "../../lib/consts";

  export default {
    name: "CompositeAspect",
    components: {Aspect},
    mixins: [AspectMixin],
    methods: {
      update_value($event, index) {
        //console.log("composite update value, index", index, $event)
        this.i_value[index] = $event
        // todo use TitleAspect in meta
        if(index === 0) {
          this.$emit(ASPECTACTION, {action:TITLE_UPDATE, value: this.i_value[index]})
        }
        this.value_change(this.i_value)
      },
      comp_extras(comp_type) {
        let xtra_copy = JSON.parse(JSON.stringify((this.extra || {})))
        // composites in lista dont have title descriptions, their kids should
        if(xtra_copy.hasOwnProperty("show_title_descr")) {
          delete xtra_copy.show_title_descr
        }
        xtra_copy.aspect_loc.push(["aspcet", comp_type.name])
        if(xtra_copy.hasOwnProperty("clear")) {
          delete xtra_copy[xtra_copy.clear]
        }
        return xtra_copy
      },
      aspectAction(event) {
        this.$emit('aspectAction',event)
      }
    },
    watch: {
      value(new_val) {
        //console.log("COMP val change", new_val)
        this.i_value = new_val;
      },
    }
  }
</script>

<style scoped>
</style>


CompositeAspect
