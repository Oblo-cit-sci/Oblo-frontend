<template lang="pug">
  div
    v-layout(wrap)
      v-flex(
        v-for="(comp_type, index) in aspect.components" :key="index"
        :class="layoutClasses")
        Aspect(
          :aspect="comp_type"
          :aspect_loc="aspect_locs[comp_type.name]"
          :mode="mode"
          :disabled="disabled"
          :conditionals="composite_conditionals"
          @aspectAction="$emit('aspectAction',$event)"
          :extra="comp_extras(comp_type)")
</template>

<script>

import Aspect from "../Aspect";
import {INT, FLOAT, COMPONENT} from "~/lib/consts";
import {loc_append} from "~/lib/aspect";
import AspectComponentMixin from "./AspectComponentMixin";

export default {
  name: "CompositeAspect",
  components: {Aspect},
  mixins: [AspectComponentMixin],
  data() {
    return {
      aspect_locs: {}
    }
  },
  created() {
    if (typeof this.value !== "object") {
      console.log("warning. wrong value for composite (probably due to template update- resetting to default", this.mvalue)
      this.reset_value()
    }
    this.update_aspect_locs()
  },
  methods: {
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
      return xtra_copy
    },
    update_aspect_locs() {
      for (let component of this.aspect.components) {
        this.aspect_locs[component.name] = loc_append(this.aspect_loc, COMPONENT, component.name)
      }
    }
  },
  computed: {
    layoutClasses() {
      if (this.aspect.components.length === 2 && this.aspect.mode === 'edit') {
        const comp_types = this.aspect.components.map(c => c.type)
        if ((comp_types[0] === INT || comp_types[0] === FLOAT) && comp_types[0] === comp_types[1]) {
          return "xs12 sm6 lg6"
        }
      }
      return "xs12 lg12"
    },
    composite_conditionals() {
      if (this.attr.add_components_as_conditionals) {
        return this.value
      } else {
        return null
      }
    }
  },
  beforeUpdate() {
    this.update_aspect_locs()
  }
}
</script>

<style scoped>
</style>



