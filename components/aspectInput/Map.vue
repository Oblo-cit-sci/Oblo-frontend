<template lang="pug" xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  div
    Title_Description(v-bind="title_description()")
    div(v-if="entry_select")
      div(v-if="!source_entry")
        SingleSelect(:options="entry_select_options" v-bind:selection.sync="selected_entry")
        v-btn(:disabled="!selected_entry" @click="source_select") select
    div(v-if="mode==='simple'")
      div(v-for="(value, index) in keys" :key="index")
        component(v-bind:is="aspectComponent(item_aspect)"
          v-bind:aspect="name_index_item_aspect(value, index)"
          v-bind:value.sync="indexed_value[index]"
          :id="value"
          v-on:create_related="create_related($event)")
    div(v-else)
      v-expansion-panel(expand v-model="panelState")
        v-expansion-panel-content(v-for="(value, index) in i_value" :key="index")
          template(v-slot:header)
            div {{value.title || index}}
          component(v-bind:is="clearableAspectComponent(item_aspect)"
            v-bind:aspect="indexed_item_aspect(index)"
            v-bind:value.sync="value"
            icon="clear",
            :id="index",
            v-on:clear="remove_value(index)",
            v-on:create_related="create_related($event)")
    div
      span(v-if="aspect.attr.min") min: {{aspect.attr.min}}, &nbsp
      span(v-if="aspect.attr.max") max: {{aspect.attr.max}}
    div(v-if="!entry_select")
      div(v-if="select")
        MultiSelect(:options="options" :selection.sync="i_value")
      div(v-else)
        v-btn(:disabled="!more_allowed" @click="add_value()" color="success") Add
          v-icon(right) add
</template>

<script>

  /*
    using an actual JS map, however, the values are just hacked in with a watch
    cause of the bindings...
    maybe just using 2 arrays one for keys, one for values would be more efficient...

   */
  import AspectMixin from "./AspectMixin"
  import {
    entries_as_options,
    get_codes_as_options,
    get_draft_by_id,
    get_entries_of_type,
    MAspectComponent
  } from "../../lib/client"
  import {aspect_default_value} from "../../lib/entry"
  import Title_Description from "../Title_Description"
  import MultiSelect from "../MultiSelect"
  import SingleSelect from "../SingleSelect"
  const ld = require("lodash")

  //
  export default {
    name: "Map",
    components: {SingleSelect, MultiSelect, Title_Description},
    mixins: [AspectMixin],
    data() {
      return {
        item_aspect: null,
        mode: null,
        count: true,
        // for composite
        panelState: [],
        // select, when code type (*)
        select: false, // select... instead of button
        options: [],
        //
        entry_select: false, // if keys: is not str...
        entry_select_options: [],
        selected_entry: null,
        source_entry: null,
        // kindof a fake array, similar to i_value in a list, in order to make the item values work
        indexed_value : []
      }
    },
    created() {
      let item_type = this.aspect.items
      //console.log("item_type", typeof (item_type))
      if (typeof (item_type) === "string") {
        if(item_type[0] === "*") {
          this.select = true
          this.options = get_codes_as_options(this.$store.state, "*liccis_flat")
        } else {
          switch (item_type) {
            case "str":
              this.mode = "simple"
              break
            default:
              console.log("unknown type for list", item_type)
          }
        }
        this.item_aspect = {
          attr: {},
          type: this.aspect.items,
          required: true
        }
      } else if (typeof (item_type) === "object") {
        //console.log("object type", this.aspect.items)
        if (this.aspect.items.type === "composite") {
          this.item_aspect = this.aspect.items
          this.item_aspect.required = true
          this.mode = "composite"
        } else {
          this.item_aspect = this.aspect.items
          //this.item_aspect.required = true
          this.mode = "simple"
        }
      }
    // KEYS
      this.i_value = new Map()
      if(this.aspect.hasOwnProperty("keys")) {
        if(this.aspect.keys === "valuelist") {
          console.log("valueslist!")
          this.entry_select = true
          this.entry_select_options = entries_as_options(get_entries_of_type(this.$store, "valuelist"))

          console.log(this.entry_select_options)
        }
      } else { // default is "str"
        // allow creating keys (as Stringinputs)
      }
    },
    methods: {
      aspectComponent(aspect) {
        return MAspectComponent(aspect, false)
      },
      // for composite
      add_value() {
        //console.log("adding value")
        this.i_value.push(aspect_default_value(this.item_aspect))
        if(this.mode === "composite") {
          ld.fill(this.panelState, false)
          this.panelState.push(true)
        }
      },
      remove_value(index) {
        this.i_value.splice(index, 1)
      },
      updateRequired(value) {
        this.i_value[parseInt(value.title)] = value.value
      },
      name_index_item_aspect(name, index) {
        let aspect = {...this.item_aspect}
        aspect.name = name
        aspect.index = index
        aspect.description = ""
        return aspect
      },
      source_select() {
        this.source_entry =   get_draft_by_id(this.$store, this.selected_entry.value)
        this.init_map(this.source_entry.aspects_values.values)
        // todo, well not only drafts...
      },
      init_map(keys) {
          this.i_value = new Map()
          for(let key of keys) {
            this.i_value.set(key, aspect_default_value(this.item_aspect))
            this.indexed_value.push(aspect_default_value(this.item_aspect))
            ld.fill(this.panelState, false)
            this.panelState.push(true)
          }
          this.value_change(this.i_value)
      }
    },
    computed: {
      more_allowed() {
        if (this.aspect.attr.max) {
          return this.i_value.length < this.aspect.attr.max
        } else {
          return true
        }
      },
      keys() {
        return Array.from(this.i_value.keys())
      }
    },
    watch : {
      indexed_value() {
        let index = 0
        for(let key of this.i_value.keys()) {
          this.i_value.set(key, this.indexed_value[index])
          index++
        }
        this.value_change(this.i_value)
      }
    }
  }
</script>

<style scoped>

</style>
