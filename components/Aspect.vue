<template lang="pug">
  div
    Title_Description(v-bind="title_description()")
    component(v-bind:is="aspectComponent(aspect)"
      v-bind:aspect="aspect"
      v-bind:value="raw_value"
      v-bind:extra="{}"
      :edit="edit"
      v-on:create_ref="$emit('create_ref',$event)"
      v-on:update:value="$emit('update:value', {value:$event})")
</template>

<script>


  import {aspect_default_value, MAspectComponent} from "../lib/entry";
  import Title_Description from "./Title_Description";

  export default {
    name: "Aspect",
    components: {
      Title_Description
    },
    props: {
      edit: {
        type: Boolean,
        default: false
      },
      aspect: Object,
      value: Object // a wrapper, which  might encode "exceptional_value"
    },
    data() {
      return {
      //  i_value: {}
      }
    },
    created() {

    },
    computed: {
      raw_value() {
        if(this.value.regular || true)
          return this.value.value
        else {
          // todo some extra value
          return aspect_default_value(this.aspect)
        }
      }
    },
    methods: {
      title_description() {
        if (!this.aspect.hasOwnProperty("name")) {
          console.log("warning: aspect", this.aspect, "has no name")
        }
        if (!this.aspect.hasOwnProperty("description")) {
          console.log("warning: aspect", this.aspect, "has no description")
        }
        return {
          title: this.aspect.name || "",
          description: this.aspect.description || ""
        }
      },
      aspectComponent() {
        return MAspectComponent(this.aspect)
      }
    }
  }
</script>

<style scoped>

</style>
