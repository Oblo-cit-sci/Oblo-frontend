<template lang="pug">
  div
    div(v-for="(comp_type, index) in aspect.components" :key="index")
      Aspect(:aspect="comp_type" v-bind:value="i_value[index]" v-on:update:value="update_value($event, index)" :edit="true")
</template>

<script>

  // todo v-on:create_ref="create_ref($event)" in the Aspect
  // todo name2index still required?

  import AspectMixin from "./AspectMixin";
  import {MAspectComponent} from "../../lib/entry";
  import Aspect from "../Aspect";

  export default {
    name: "CompositeAspect",
    components: {Aspect},
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
      },
      update_value($event , index) {
        this.i_value[index] = $event
        console.log("comp update", this.aspect.name, $event, this.i_value)
        //this.$emit("update:value",)
      }
    }
  }
</script>

<style scoped>

</style>


CompositeAspect
