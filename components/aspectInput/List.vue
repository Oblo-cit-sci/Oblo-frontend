<template lang="pug">
  div
    div(v-if="mode==='simple'")
      h3 {{aspect.name}}
      div {{aspect.description}}
      div(v-for="(value, index) in values" :key="index")
        component(v-bind:is="aspectComponent(item_aspect)"
          v-bind:aspect="indexed_item_aspect(index)"
          v-bind:value.sync="value"
          v-on:update-required="updateRequired"
          v-on:create_related="create_related($event)")
        v-btn(:val_index="index" @click="remove_value($event, index)" icon color="warning")
          v-icon clear
      div
        v-btn(:disabled="!more_allowed" @click="add_value()" color="success") Add
          v-icon(right) add
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import {MAspectComponent} from "../../lib/client";

  export default {
    name: "List",
    mixins: [AspectMixin],
    data() {
      return {
        values: [],
        item_aspect: null,
        mode: null
      }
    },
    created() {
      let item_type = this.aspect.items;

      console.log(typeof (item_type))
      if (typeof (item_type) === "string") {
        switch (item_type) {
          case "str":
            this.mode = "simple";
            break;
          default:
            console.log("unknown type for list", item_type);
        }
        this.item_aspect = {
          attr: {},
          name: this.aspect.name + " value",
          type: this.aspect.items,
          required: true
        }

      } else if (typeof (item_type) === "object") {
        this.item_aspect = this.aspect.items;
        this.item_aspect.required = true;
        this.mode = "simple";
      }

      console.log(this.mode);
    },
    methods: {
      aspectComponent(aspect) {
        return MAspectComponent(aspect);
      },
      add_value() {
        //console.log("add");
        this.values.push("");
      },
      remove_value(event, index) {
        console.log(index);
        console.log("b", this.values);
        this.values.splice(index, 1);
        console.log("a", this.values);
      },
      updateRequired(value) {
        console.log("ar", value);
        this.values[parseInt(value.title)] = value.value;
      },
      indexed_item_aspect(index) {
        let aspect = {...this.item_aspect};
        aspect.name = "" + index;
        return aspect;
      }
    },
    computed: {
      more_allowed() {
        return true
      }
    }
  }
</script>

<style scoped>

</style>
