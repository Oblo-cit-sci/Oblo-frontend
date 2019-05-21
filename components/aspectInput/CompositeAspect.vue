<template lang="pug">
  div
    h3 {{aspect.name}}
    div {{aspect.description}}

    div(v-for="(comp_type, index) in aspect.components" :key="index")
      component(v-bind:is="AspectComponent(comp_type)"
        v-bind:aspect="comp_type"
        v-bind:value.sync="i_value[comp_type.name]"
        v-on:update-required="updateRequired"
        v-on:create_related="create_related($event)")
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import {MAspectComponent} from "../../lib/client";

  export default {
    name: "CompositeAspect",
    mixins: [AspectMixin],

    methods: {
      AspectComponent(aspect) {
        return MAspectComponent(aspect, false, false);
      },
      updateRequired(value) {
        // nothn todo here
      }
    }
  }
</script>

<style scoped>

</style>


CompositeAspect
