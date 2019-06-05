<template lang="pug">
  div
    component(v-bind:is="aspectComponent(aspect_descr)"
      v-bind:aspect="aspect_descr"
      v-bind:value="raw_value"
      v-bind:extra="{}"
      :edit="edit"
      v-on:update:value="$emit('update:value', {value:$event})")
</template>

<script>
  import {MAspectComponent} from "../lib/client";
  import TextShort from "./aspectInput/TextShort";
  import {aspect_default_value} from "../lib/entry";

  // todo pull this down from entry
  // v-on:create_related="create_related($event)")

  export default {
    name: "Aspect",
    components: {
      TextShort
    },
    props: {
      edit: {
        type: Boolean,
        default: false
      },
      aspect_descr: Object,
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
          return aspect_default_value(this.aspect_descr)
        }
      }
    },
    methods: {
      aspectComponent() {
        return MAspectComponent(this.aspect_descr)
      }
    }
  }
</script>

<style scoped>

</style>
