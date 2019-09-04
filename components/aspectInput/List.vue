<template lang="pug">
  div
    div(v-if="!select")
      div(v-if="is_simple")
        div(v-for="(value, index) in i_value" :key="index")
          Aspect(
            :aspect="indexed_item_aspect(index)"
            :value="i_value[index]"
            v-on:update:value="update_value($event, index)"
            :mode="mode"
            :extra="list_extra(index)"
            v-on:entryAction="handleEntryAction($event, index)")
            v-on:append-outer="remove_value(index)"
          v-btn(v-if="requires_delete" small @click="remove_value(index)") delete {{extra.itemname}}
      div(v-else)
        v-expansion-panel(
          expand
          v-model="panelState")
          v-expansion-panel-content(
            v-for="(value, index) in i_value"
            :key="index"
            :id="panel_id(index)"
          )
            template(v-slot:header)
              div {{titles[index]|| index + 1}}
            Aspect(
              :aspect="indexed_item_aspect(index)"
              :value="i_value[index]"
              @update:value="update_value($event, index)"
              :mode="mode"
              :extra="list_extra(index)"
              v-on:entryAction="$emit('entryAction',$event)"
              v-on:aspectAction="aspectAction($event, index)")
            v-btn(v-if="requires_delete" small @click="remove_value(index)") delete {{item_name}}
      div
        span {{count_text}}, &nbsp
        span(v-if="min===max && min !== null") required: {{min}}
        span(v-else)
          span(v-if="min") min: {{min}} &nbsp;
          span(v-if="max") max: {{max}}
    div(v-if="select")
      MultiSelect(:options="options" :selection="i_value")
    div(v-else-if="!readOnly")
      v-btn(:disabled="!more_allowed" @click="add_value()" :color="requieres_more_color") Add {{item_name}}
        v-icon(right) add
</template>

<script>

  import AspectMixin from "./AspectMixin";
  import {get_codes_as_options} from "../../lib/client";
  import {aspect_loc_str, aspect_wrapped_default_value, MAspectComponent} from "../../lib/entry";
  import MultiSelect from "../MultiSelect";
  import Aspect from "../Aspect";
  import ListMixin from "../ListMixin";
  import {INDEX, TITLE_UPDATE} from "../../lib/consts";

  import goTo from 'vuetify/lib/components/Vuetify/goTo'
  import {aspect_loc_str2arr} from "../../lib/aspect";

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
        structure: null, // SIMPLE OR PANELS
        //count: true,
        item_name: this.aspect.attr.itemname || "item",
        // for composite
        panelState: [],
        // select, when code type (*)
        select: false, // select... instead of button
        options: [],
        titles: [],
        goto_new: null
      }
    },
    created() {
      //console.log("LIST ", this.aspect.name, this.aspect, this.value)
      let item_type = this.aspect.items;
      // todo. list, are extended lists by user, not select lists
      if (typeof (item_type) === "string") {
        if (item_type[0] === "*") {
          this.select = true
          //console.log("list multi-select", item_type)
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
          let titleAspectName = this.item_aspect.attr.titleAspect || this.item_aspect.components[0].name
          //
          // fill in the values of the titleAspect
          for (let item_index in this.i_value) {
            let list_items = this.i_value[item_index].value
            let title_comp_value = this.$_.find(list_items, list_item => list_item.name === titleAspectName).value
            this.titles.push(title_comp_value)
            this.panelState.push(false)
          }
        } else {
          this.item_aspect = this.aspect.items;
          //this.item_aspect.required = true;
          this.structure = SIMPLE
        }
      }

      this.set_min_max()

      if (this.i_value.length === 0) {
        for (let i = 0; i < this.aspect.attr.create || 0; i++) {
          this.add_value()
        }
      }
      //console.log(this.aspect.attr.info_ref)
      /*if (this.aspect.attr.info_ref) {
        console.log("LIST-create.info_ref", this.aspect.attr.info_ref)
        let aspect_loc = aspect_loc_str2arr(this.aspect.attr.info_ref)
        this.reference_values = this.$store.getters["entries/get_entry_value"]("", aspect_loc, this.entry)
        for (let i = 0; i < this.reference_values.length; i++) {
          console.log(this.reference_values[i])
        }
      }*/
    },
    updated() {
      if (this.goto_new) {
        setTimeout(() => {
            goTo(this.goto_new, {
              duration: 400,
              easing: "easeOutCubic",
              offset: 80,
            })
            this.goto_new = null
          }, 300
        )
      }
    },
    methods: {
      update_value($event, index) {
        //console.log("composite update value, index", index, $event)
        this.i_value[index] = $event
        // todo use TitleAspect in meta
        this.value_change(this.i_value)
      },
      clearableAspectComponent(aspect) {
        return MAspectComponent(aspect, this.mode)
      },
      // for composite
      add_value() {
        this.i_value.push(aspect_wrapped_default_value(this.item_aspect))
        this.titles.push(null)
        if (this.structure === PANELS) {
          this.$_.fill(this.panelState, false)
          this.panelState.push(true)
          let scroll_destination = "L-" + aspect_loc_str(this.$_.concat(this.extra.aspect_loc, [["index", this.i_value.length - 1]]))
          this.goto_new = "#" + scroll_destination
        }
        this.value_change(this.i_value)
        // scroll to new tab

      },
      remove_value(index) {
        this.i_value.splice(index, 1)
        this.titles.splice(index, 1)
        //console.log(this.i_value)
        this.value_change(this.i_value)
      },
      indexed_item_aspect(index) {
        let aspect = {...this.item_aspect}
        // could maybe be 0
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
        xtra_copy.aspect_loc.push([INDEX, index])
        xtra_copy.no_title = this.structure === PANELS
        xtra_copy.clear = "no_title"
        xtra_copy.listitem = true

        //xtra_copy.structure = this.structure
        xtra_copy.itemname = this.item_name
        if (xtra_copy.hasOwnProperty("titleAspect")) {
          delete xtra_copy.titleAspect
        }
        return xtra_copy
      },
      aspectAction(event, index) {
        if (event.action === TITLE_UPDATE) {
          this.titles[index] = event.value
        }
      },
      panel_id(index) {
        return "L-" + aspect_loc_str(this.$_.concat(this.extra.aspect_loc, [["index", index]]))
      }
    },
    computed: {
      is_simple() {
        return this.structure === SIMPLE
      },
      count_text() {
        const le = this.i_value.length
        const attr = this.aspect.attr
        const name = this.item_name
        const item_word = le === 1 ? name :
          (attr.itemname_plural || name + "s")
        return +le + " " + item_word
      },
      requires_delete() {
        let itemtype = this.aspect.items.type
        if (itemtype === "str" || itemtype === "int" || itemtype === "float")
          return false
        return true
      }
    }
  }
</script>

<style scoped>

  .panel_content {
    width: 98%;
    margin: auto;
  }
</style>
