<template lang="pug">
  div
    div(v-for="(comp_type, index) in aspect.components" :key="index")
      Aspect(
        :aspect="comp_type"
        :value="i_value[index]"
        v-on:update:value="update_value($event, index)"
        :edit="true"
        :mode="mode"
        :extra="comp_extras(comp_type)"
        v-on:entryAction="$emit('entryAction',$event)"
        v-on:aspectAction="aspectAction")
</template>

<script>

  // todo v-on:create_ref="create_ref($event)" in the Aspect
  // todo name2index still required?

  import AspectMixin from "./AspectMixin";
  import Aspect from "../Aspect";
  import {ASPECTACTION, TITLE_UPDATE} from "../../lib/consts";

  export default {
    name: "CompositeAspect",
    components: {Aspect},
    mixins: [AspectMixin],
    data() {
      return {
        title: "XXX" // todo pass it up for nice title in lists...
      }
    },
    methods: {
      update_value($event, index) {
        this.i_value[index] = $event
        if(index === 0) {
          this.$emit(ASPECTACTION, {action:TITLE_UPDATE, value: this.i_value[index]})
        }
        this.value_change(this.i_value)
      },
      comp_extras(comp_type) {
        let xtra_copy = JSON.parse(JSON.stringify((this.extra || {})))
        if(xtra_copy.hasOwnProperty("listitem")) {
          delete xtra_copy.listitem
        }
        xtra_copy.aspect_loc.push(["aspcet", comp_type.name])
        if(xtra_copy.hasOwnProperty("clear")) {
          delete xtra_copy[xtra_copy.clear]
        }
        return xtra_copy
      },
      aspectAction(event) {
        console.log("ASPECT ACTION", event)
        $emit('aspectAction',$event)
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
