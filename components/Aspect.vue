<template lang="pug">
  div
    Title_Description(v-bind="title_description(aspect)")
    v-switch(v-if="has_alternative"
      v-model="use_regular"
      :label="use_regular ? `regular value`:`alternative value`"
      color="primary")
    component(v-bind:is="aspectComponent(aspect)"
      v-bind:aspect="aspect"
      v-bind:value="raw_value"
      v-bind:extra="extra"
      :edit="edit"
      :disabled="!use_regular"
      v-on:create_ref="$emit('create_ref', $event)"
      v-on:update:value="$emit('update:value', {value:$event})")
    div(v-if="!use_regular")
      Title_Description(v-bind="title_description(aspect.attr.alternative)")
      component(v-bind:is="aspectComponent(aspect.attr.alternative)"
        v-bind:aspect="aspect.attr.alternative"
        v-bind:value="raw_value"
        v-on:update:value="$emit('update:value', {value:$event})")
</template>

<script>

  export default {
    name: "Aspect",
    components: {
      Title_Description
    },
    props: {
      mode: {
        type: String,
        default: "view"
      },
      aspect: Object,
      value: Object, // a wrapper, which  might encode "exceptional_value"
      extra: Object
    },
    data() {
      return {
        //  i_value: {}
        edit: false,
        has_alternative: false,
        use_regular: true
      }
    },
    created() {
      this.has_alternative = this.aspect.attr.hasOwnProperty("alternative")
      if (this.aspect.attr.mode === "view") {
        // sets always to VIEW, nothing really
      } else { // edit
        this.edit = true
      }
    },
    // boolean check is not required, since "false" is the default
    computed: {
      raw_value() {
        if (this.value.regular || true)
          return this.value.value
        else {
          // todo some extra value
          return aspect_default_value(this.aspect)
        }
      }
    },
    methods: {
      title_description(aspect_descr) {
        if (!aspect_descr.hasOwnProperty("name")) {
          //console.log("warning: aspect", aspect_descr, "has no name")
        }
        if (!aspect_descr.hasOwnProperty("description")) {
          //console.log("warning: aspect", this.aspect, "has no description")
        }
        return {
          title: aspect_descr.name || "",
          description: aspect_descr.description || ""
        }
      },
      aspectComponent(aspect_descr) {
        return MAspectComponent(aspect_descr)
      }
    }
  }

  import {aspect_default_value, entry_ref, get_local_entry, MAspectComponent} from "../lib/entry";

  import Title_Description from "./Title_Description";
</script>

<style scoped>

</style>
