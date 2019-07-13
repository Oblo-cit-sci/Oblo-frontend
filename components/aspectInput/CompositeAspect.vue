<template lang="pug">
  div
    v-layout(row wrap)
      v-flex(
        v-for="(comp_type, index) in aspect.components" :key="index"
        :class="layoutClasses")
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
    the flexes could have "xs12 sm6 lg6"
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
        if (index === 0) {
          this.$emit(ASPECTACTION, {action: TITLE_UPDATE, value: this.i_value[index]})
        }
        this.value_change(this.i_value)
      },
      comp_extras(comp_type) {
        let xtra_copy = JSON.parse(JSON.stringify((this.extra || {})))
        // composites in lista dont have title descriptions, their kids should
        // todo not sure what we still need!!
        if (xtra_copy.hasOwnProperty("clear")) {
          delete xtra_copy.clear
        }
        if (xtra_copy.hasOwnProperty("no_title")) {
          delete xtra_copy.no_title
        }
        if (xtra_copy.hasOwnProperty("listitem")) {
          delete xtra_copy.listitem
        }
        xtra_copy.aspect_loc.push(["aspcet", comp_type.name])
        return xtra_copy
      },
      aspectAction(event) {
        this.$emit('aspectAction', event)
      }
    },
    computed: {
      layoutClasses() {
        if(this.aspect.components.length === 2) {
          return "xs12 sm6 lg6"
        } else
          return "xs12 lg12"
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
