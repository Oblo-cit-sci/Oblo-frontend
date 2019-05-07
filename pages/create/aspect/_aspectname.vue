<template lang="pug">
  div HELLO

</template>

<script>

  /*
      component(v-bind:is="aspectComponent(aspect)"
      v-bind:aspect="aspect"
      v-bind:value.sync="aspects_values[aspect.name]"
      v-on:update-required="updateRequired"
      v-on:create_related="create_related($event)")

   */
  import Licci from "~~/components/aspectInput/special/Licci";

  import {MAspectComponent, complete_activities, get_entrytpe} from "../../../lib/client";

  export default {
    name: "SingleAspectPage",
    components: {Licci},
    data() {
      return {
       /* aspect : {
          name:""
        },
        aspects_values: {

        } */
      }
    },
    methods: {
      aspectComponent(aspect) {
        return MAspectComponent(aspect);
      },
      updateRequired() {
        // TODO
      },
      create_related() {
        // TODO
      }
    }
  }
</script>

<style scoped>

</style>
