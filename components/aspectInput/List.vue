<template lang="pug">
  div
    div(v-if="!select")
      div(v-if="is_simple")
        div(v-for="(value, index) in i_value" :key="index")
          Aspect(
            :aspect="indexed_item_aspect(index)"
            :value.sync="i_value[index]"
            :edit="true"
            :mode="mode"
            :extra="extra_down"
            v-on:entryAction="handleEntryAction($event, index)")
            v-on:append-outer="remove_value(index)"
      div(v-else)
        v-expansion-panel(expand v-model="panelState")
          v-expansion-panel-content(v-for="(value, index) in i_value" :key="index")
            template(v-slot:header)
              div {{value.title || index + 1}}
            Aspect(
              :aspect="indexed_item_aspect(index)"
              :value.sync="value"
              :mode="mode"
              :extra="extra_down"
              v-on:entryAction="$emit('entryAction',$event)")
            v-btn(v-if="!readOnly" @click="remove_value(index)") remove
      div
        span(v-if="aspect.attr.min") min: {{aspect.attr.min}}, &nbsp;
        span(v-if="aspect.attr.max") max: {{aspect.attr.max}}
    div(v-if="select")
      MultiSelect(:options="options" :selection="i_value")
    div(v-else-if="!readOnly")
      v-btn(:disabled="!more_allowed" @click="add_value()" color="success") Add
        v-icon(right) add
</template>

<script>

  import AspectMixin from "./AspectMixin";
  import {get_codes_as_options} from "../../lib/client";
  import {aspect_wrapped_default_value, MAspectComponent} from "../../lib/entry";
  import MultiSelect from "../MultiSelect";
  import Aspect from "../Aspect";

  // todo, pass the extra in a more intelligent way down, not to all the same

  const SIMPLE = "simple"
  const PANELS = "panels"

  export default {
    name: "List",
    components: {Aspect, MultiSelect},
    mixins: [AspectMixin],
    data() {
      return {
        item_aspect: null,
        structure: null,
        count: true,
        // for composite
        panelState: [],
        // select, when code type (*)
        select: false, // select... instead of button
        options: [],
        extra_down: null
      }
    },
    created() {
      let item_type = this.aspect.items;
      if (typeof (item_type) === "string") {
        if (item_type[0] === "*") {
          this.select = true
          console.log("list multi-select", item_type)
          this.options = get_codes_as_options(this.$store.state, item_type)
        } else {
          switch (item_type) {
            case "str":
              this.structure = SIMPLE
              break;
            case "int":
              this.structure = SIMPLE
              break
            default:
              console.log("unknown type for list", item_type);
          }
        }
        this.item_aspect = {
          attr: {},
          type: this.aspect.items,
          required: true
        }
      } else if (typeof (item_type) === "object") {
        // console.log("object type", this.aspect.items)
        if (this.aspect.items.type === "composite") {
          this.item_aspect = this.aspect.items;
          this.item_aspect.required = true;
          this.structure = PANELS
        } else {
          this.item_aspect = this.aspect.items;
          //this.item_aspect.required = true;
          this.structure = "simple";
        }
      }

      let extra_copy = JSON.parse(JSON.stringify(this.extra || {}))
      // probably not necessaery
      /*if (extra_copy.hasOwnProperty("listitem")) {
        delete extra_copy.listitem
      }*/
      this.extra_down = Object.assign(extra_copy, {
        aspect_ref: this.aspect_ref,
        listitem: this.is_simple // non-simple ones, have a button here
      })

      if(this.i_value.length === 0) {
        for (let i = 0; i < this.aspect.attr.create || 0; i++) {
          console.log(i)
          this.add_value()
        }
      }
    },
    methods: {
      clearableAspectComponent(aspect) {
        return MAspectComponent(aspect, false, true)
      },
      // for composite
      add_value() {
        this.i_value.push(aspect_wrapped_default_value(this.item_aspect))
        if (this.structure === PANELS) {
          this.$_.fill(this.panelState, false)
          this.panelState.push(true)
        }
      },
      remove_value(index) {
        console.log("remove index", index)
        //console.log(this.i_value)
        this.i_value.splice(index, 1)
        //console.log(this.i_value)
        this.value_change(this.i_value)
      },
      /*updateRequired(value) {
        this.i_value[parseInt(value.title)] = value.value
      },*/
      indexed_item_aspect(index) {
        let aspect = {...this.item_aspect}
        aspect.name = "" + (index + 1)
        return aspect
      }, handleEntryAction(event, index) {
        if (event.action === "clear") {
          this.remove_value(index)
        } else {
          $emit('entryAction', $event)
        }
      }
    },
    computed: {
      more_allowed() {
        if (this.aspect.attr.max) {
          return this.i_value.length < this.aspect.attr.max;
        } else {
          return true;
        }
      },
      is_simple() {
        return this.structure === SIMPLE
      }
    }
  }
</script>

<style scoped>

</style>
