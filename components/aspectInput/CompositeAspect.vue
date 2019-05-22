<template lang="pug">
  div
    h3 {{aspect.name}}
    div {{aspect.description}}

    div(v-for="(comp_type, index) in aspect.components" :key="index")
      component(v-bind:is="AspectComponent(comp_type)"
        v-bind:aspect="comp_type"
        v-bind:value.sync="i_value[index]"
        v-on:create_related="create_related($event)")
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import {MAspectComponent} from "../../lib/client";

  export default {
    name: "CompositeAspect",
    mixins: [AspectMixin],
    data() {
      return {
        name2index: {}
      }
    },
    created() {
      for(let comp_index in this.aspect.components) {
        this.name2index[this.aspect.components[comp_index].name] = comp_index
      }
    },
    methods: {
      AspectComponent(aspect) {
        return MAspectComponent(aspect, false, false);
      }
    }
  }
</script>

<style scoped>

</style>


CompositeAspect
