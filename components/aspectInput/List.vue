<template lang="pug">
  div
    Title_Description(v-bind="title_description()")
    div(v-if="!select")
      div(v-if="mode==='simple'")
        div(v-for="(value, index) in i_value" :key="index")
          component(v-bind:is="clearableAspectComponent(item_aspect)"
            v-bind:aspect="indexed_item_aspect(index)"
            v-bind:value.sync="i_value[index ]"
            icon="clear"
            :id="index"
            v-on:clear="remove_value(index)",
            v-on:create_related="create_related($event)")
      div(v-else)
        v-expansion-panel(expand v-model="panelState")
          v-expansion-panel-content(v-for="(value, index) in i_value" :key="index")
            template(v-slot:header)
              div {{value.title || index + 1}}
            component(v-bind:is="clearableAspectComponent(item_aspect)"
              v-bind:aspect="indexed_item_aspect(index)"
              v-bind:value.sync="value"
              icon="clear",
              :id="index",
              v-on:clear="remove_value(index)",
              v-on:create_related="create_related($event)")
      div
        span(v-if="aspect.attr.min") min: {{aspect.attr.min}}, &nbsp;
        span(v-if="aspect.attr.max") max: {{aspect.attr.max}}
    div(v-if="select")
      MultiSelect(:options="options" :selection.sync="i_value")
    div(v-else)
      v-btn(:disabled="!more_allowed" @click="add_value()" color="success") Add
        v-icon(right) add
</template>

<script>

  import AspectMixin from "./AspectMixin";
  import {get_codes_as_options} from "../../lib/client";
  import {aspect_default_value, MAspectComponent} from "../../lib/entry";
  import Title_Description from "../Title_Description";
  import MultiSelect from "../MultiSelect";

  //
  export default {
    name: "List",
    components: {MultiSelect, Title_Description},
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
        options: []
      }
    },
    created() {
      let item_type = this.aspect.items;

      if (typeof (item_type) === "string") {

        if(item_type[0] === "*") {
          this.select = true
          this.options = get_codes_as_options(this.$store.state, "*liccis_flat")
        } else {
          switch (item_type) {
            case "str":
              this.mode = "simple";
              break;
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
        console.log("object type", this.aspect.items)
        if (this.aspect.items.type === "composite") {
          this.item_aspect = this.aspect.items;
          this.item_aspect.required = true;
          this.mode = "composite"
        } else {
          this.item_aspect = this.aspect.items;
          //this.item_aspect.required = true;
          this.mode = "simple";
        }
      }

    },
    methods: {
      clearableAspectComponent(aspect) {
        return MAspectComponent(aspect, false, true)
      },
      // for composite
      add_value() {
        console.log("adding value")
        this.i_value.push(aspect_default_value(this.item_aspect))
        this.$_.fill(this.panelState, false)
        this.panelState.push(true)
      },
      remove_value(index) {
        console.log("remove index", index)
        console.log(this.i_value)
        this.i_value.splice(index, 1)
        console.log(this.i_value)
        this.value_change(this.i_value)
      },
      /*updateRequired(value) {
        this.i_value[parseInt(value.title)] = value.value
      },*/
      indexed_item_aspect(index) {
        let aspect = {...this.item_aspect}
        aspect.name = "" + index
        return aspect
      }
    },
    computed: {
      more_allowed() {
        if (this.aspect.attr.max) {
          return this.i_value.length < this.aspect.attr.max;
        } else {
          return true;
        }
      }
    }
  }
</script>

<style scoped>

</style>
