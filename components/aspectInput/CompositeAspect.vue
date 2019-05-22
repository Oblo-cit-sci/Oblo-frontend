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
        console.log(comp_index)
        console.log(this.aspect.components[comp_index])
        this.name2index[this.aspect.components[comp_index].name] = comp_index
      }
    },
    methods: {
      AspectComponent(aspect) {
        return MAspectComponent(aspect, false, false);
      },
      /*updateRequired(update_on) {
        console.log("composite val update...", update_on)
        // TODO everywhere. aspects have a "name" not title!!
        let asp_index = this.name2index[update_on.title]
        this.i_value[asp_index] = update_on.value
        // nothn todo here
      } */
    }
  }
</script>

<style scoped>

</style>


CompositeAspect
