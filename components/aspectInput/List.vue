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
            :extra="list_extra(index)"
            v-on:entryAction="handleEntryAction($event, index)")
            v-on:append-outer="remove_value(index)"
      div(v-else)
        v-expansion-panel(expand v-model="panelState")
          v-expansion-panel-content(v-for="(value, index) in i_value" :key="index")
            template(v-slot:header)
              div {{titles[index]|| index + 1}}
            Aspect(
              :aspect="indexed_item_aspect(index)"
              :value.sync="value"
              :mode="mode"
              :extra="list_extra(index)"
              v-on:entryAction="$emit('entryAction',$event)"
              v-on:aspectAction="aspectAction($event, index)"
              )
            v-btn(v-if="!readOnly" @click="remove_value(index)") remove
      div
        span {{count_text}}, &nbsp
        span(v-if="min===max && min !== null") required: {{min}}
        span(v-else)
          span(v-if="min") min: {{min}} &nbsp;
          span(v-if="max") max: {{max}}
    div(v-if="select")
      MultiSelect(:options="options" :selection="i_value")
    div(v-else-if="!readOnly")
      v-btn(:disabled="!more_allowed" @click="add_value()" :color="requieres_more_color") Add {{aspect.attr.itemname}}
        v-icon(right) add
</template>

<script>

  import AspectMixin from "./AspectMixin";
  import {get_codes_as_options, resolve_aspect_ref} from "../../lib/client";
  import {aspect_wrapped_default_value, MAspectComponent} from "../../lib/entry";
  import MultiSelect from "../MultiSelect";
  import Aspect from "../Aspect";
  import ListMixin from "../ListMixin";

  // todo, pass the extra in a more intelligent way down, not to all the same

  const SIMPLE = "simple"
  const PANELS = "panels"

  export default {
    name: "List",
    components: {Aspect, MultiSelect},
    mixins: [AspectMixin, ListMixin],
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
        itemname: this.aspect.attr.itemname || "item",
        titles: []
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

      this.set_min_max()

      if(this.i_value.length === 0) {
        for (let i = 0; i < this.aspect.attr.create || 0; i++) {
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
        this.titles.push(null)
        if (this.structure === PANELS) {
          this.$_.fill(this.panelState, false)
          this.panelState.push(true)
        }
      },
      remove_value(index) {
        console.log("remove index", index)
        //console.log(this.i_value)
        this.i_value.splice(index, 1)
        this.titles.splice(index, 1)
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
      },
      list_extra(index) {
        let xtra_copy = JSON.parse(JSON.stringify(this.extra))
        xtra_copy.aspect_loc.push(["index", index])
        xtra_copy.no_title = true
        xtra_copy.clear = "no_title"
        return xtra_copy
      },
      aspectAction(event, index) {
        this.titles[index] = event.value.value
      }
    },
    computed: {
      more_allowed() {
        return !this.max || this.i_value.length < this.max
      },
      is_simple() {
        return this.structure === SIMPLE
      },
      count_text() {
        const le = this.i_value.length
        const attr = this.aspect.attr
        const name = attr.itemname || "item"
        const item_word = le === 1 ? name:
          (attr.itemname_plural ||  name + "s")
        return  +  le + " " + item_word
      }
    }
  }
</script>

<style scoped>

</style>
