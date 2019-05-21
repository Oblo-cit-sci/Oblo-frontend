<template lang="pug">
  div
    Title_Description(v-bind="title_description()")
    div(v-if="mode==='simple'")
      div(v-for="(value, index) in i_value" :key="index")
        component(v-bind:is="clearableAspectComponent(item_aspect)"
          v-bind:aspect="indexed_item_aspect(index)"
          v-bind:value.sync="value"
          v-on:update-required="updateRequired"
          icon="clear",
          :id="index",
          v-on:clear="remove_value(index)",
          v-on:create_related="create_related($event)")
      div
        span(v-if="aspect.attr.min") min: {{aspect.attr.min}}, &nbsp;
        span(v-if="aspect.attr.max") max: {{aspect.attr.max}}
      v-btn(:disabled="!more_allowed" @click="add_value()" color="success") Add
        v-icon(right) add
</template>

<script>

  import AspectMixin from "./AspectMixin";
  import {MAspectComponent} from "../../lib/client";
  import {aspect_default_value} from "../../lib/entry";
  import Title_Description from "../Title_Description";

  //
  export default {
    name: "List",
    components: {Title_Description},
    mixins: [AspectMixin],
    data() {
      return {
        item_aspect: null,
        mode: null,
        count: true
      }
    },
    created() {
      let item_type = this.aspect.items;

      // console.log(typeof (item_type))
      if (typeof (item_type) === "string") {
        switch (item_type) {
          case "str":
            this.mode = "simple";
            break;
          case "composite":
            this.mode = "page"
            break
          default:
            console.log("unknown type for list", item_type);
        }
        this.item_aspect = {
          attr: {},
          type: this.aspect.items,
          required: true
        }

      } else if (typeof (item_type) === "object") {
        this.item_aspect = this.aspect.items;
        this.item_aspect.required = true;
        this.mode = "simple";
      }

    },
    methods: {
      clearableAspectComponent(aspect) {
        return MAspectComponent(aspect, false, true);
      },
      add_value() {
        this.i_value.push(aspect_default_value(this.item_aspect));
      },
      remove_value(index) {
        this.i_value.splice(index, 1);
      },
      updateRequired(value) {
        this.i_value[parseInt(value.title)] = value.value;
      },
      indexed_item_aspect(index) {
        let aspect = {...this.item_aspect};
        aspect.name = "" + index;
        return aspect;
      }
    },
    computed: {
      more_allowed() {
        if(this.aspect.attr.max) {
          return this.i_value.length <  this.aspect.attr.max;
        } else {
          return true;
        }
      }
    }
  }
</script>

<style scoped>

</style>
