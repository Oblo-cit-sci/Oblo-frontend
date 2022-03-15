<template lang="pug">
  div
    v-container.pt-1.pb-0(v-if="compact" justify-center align-center)
      v-row.pl-1()
        v-col.pa-0.ma-0(
          v-for="(comp_type, index) in aspect.components" :key="index"
          alignSelf="stretch" :cols="cols(comp_type)")
          Aspect(
            :aspect="comp_type"
            :ext_value="value[comp_type.name]"
            @update:ext_value="update_component_value(comp_type.name, $event)"
            :mode="mode"
            :disabled="disabled"
            :ref="comp_type.name"
            :conditionals="composite_conditionals"
            @aspectAction="$emit('aspectAction',$event)"
            @has_changed="has_changed(comp_type.name, $event)"
            :extra="comp_extras(comp_type)")
    v-layout(v-else wrap)
      v-expansion-panels(v-if="collapsable")
        v-expansion-panel
          v-expansion-panel-header {{panel_header}}
          v-expansion-panel-content
            v-flex(
              v-for="(comp_type, index) in aspect.components" :key="index"
              :class="layoutClasses")
              Aspect(
                :aspect="comp_type"
                :ext_value="value[comp_type.name]"
                @update:ext_value="update_component_value(comp_type.name, $event)"
                :mode="mode"
                :disabled="disable"
                :ref="comp_type.name"
                :conditionals="composite_conditionals"
                @has_changed="has_changed(comp_type.name, $event)"
                @aspectAction="$emit('aspectAction',$event)"
                :extra="comp_extras(comp_type)")
      v-flex(v-else
      v-for="(comp_type, index) in aspect.components" :key="index"
        :class="layoutClasses")
        Aspect(
          :aspect="comp_type"
          :ext_value="value[comp_type.name]"
          @update:ext_value="update_component_value(comp_type.name, $event)"
          :mode="mode"
          :disabled="disabled"
          :question_only="question_only"
          :ref="comp_type.name"
          :conditionals="composite_conditionals"
          @has_changed="has_changed(comp_type.name, $event)"
          @aspectAction="$emit('aspectAction',$event)"
          :extra="comp_extras(comp_type)")
</template>

<script>

import Aspect from "../Aspect";
import {INT, FLOAT} from "~/lib/consts";
import AspectComponentMixin from "./AspectComponentMixin";
import AspectListMixin from "~/components/global/AspectListMixin"

export default {
  name: "CompositeAspect",
  components: {Aspect},
  mixins: [AspectComponentMixin, AspectListMixin],
  data() {
    return {}
  },
  created() {
    if (typeof this.value !== "object") {
      console.log("warning. wrong value for composite (probably due to template update- resetting to default", this.mvalue)
      this.reset_value()
    }
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
    update_component_value(component_name, value) {
      // console.log("composite_update_component_value")
      this.update_value(Object.assign(this.$_.cloneDeep(this.value), {[component_name]: value}))
    },
    has_changed(comp_name, event) {
      // console.log("composition.has_changed", comp_name, event)
      this.$emit("has_changed", {name: `${this.aspect.name}.${comp_name}`, change: event.change})
    },
    refresh_original() {
      for (let component_aspect of Object.values(this.$refs)) {
        component_aspect[0].refresh_original()
      }
    },
    cols(component) {
      if (this.$vuetify.breakpoint.mdAndUp) {
        if (component.attr?.columns) {
          // console.log("custom-cols", component.attr.columns)
          return component.attr.columns
        }
        return this.base_cols / 3
      }
      return this.base_cols
    }
  },
  computed: {
    compact() {
      return this.attr.compact
    },
    collapsable() {
      return this.attr.collapsable || false
    },
    panel_header() {
      const title_component = this.attr.titleComponent || this.aspect.components[0].name
      const comp_value = this.value[title_component]
      console.log(comp_value)
      let text = ""
      if (comp_value.text) {
        text = comp_value.text
      } else {
        text = comp_value.value
      }
      if (!text) {
        return "..."
      }
      return text
    },
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
        console.warn("composite attribute add_components_as_conditionals is deprecated: " +
          "use: use_components_as_conditionals")
        return this.value
      } else if (this.attr.use_components_as_conditionals) {
        return this.value
      } else if (this.attr.merge_in_components_as_conditionals) {
        Object.keys(this.value).forEach(name => {
          if (Object.keys(this.conditionals).includes(name)) {
            console.warn("composite conditionals merge conflict: " +
              `'${name}' is already defined in conditionals. will overwrite with component value`)
          }
        })
        return Object.assign(this.$_.cloneDeep(this.conditionals), this.value)
      } else
        return this.conditionals
    },
  }
}
</script>

<style scoped>
</style>



