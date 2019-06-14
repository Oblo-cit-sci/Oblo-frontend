<template lang="pug">
  div
    div(v-for="(comp_type, index) in aspect.components" :key="index")
      Aspect(
        :aspect="comp_type"
        :value="i_value[index]"
        v-on:update:value="update_value($event, index)"
        :edit="true"
        :mode="mode"
        :extra="extra"
        v-on:entryAction="$emit('entryAction',$event)")
</template>

<script>

  // todo v-on:create_ref="create_ref($event)" in the Aspect
  // todo name2index still required?

  import AspectMixin from "./AspectMixin";
  import Aspect from "../Aspect";

  export default {
    name: "CompositeAspect",
    components: {Aspect},
    mixins: [AspectMixin],
    data() {
      return {
        title: "XXX" // todo pass it up for nice title in lists...
      }
    },
    methods: {
      update_value($event , index) {
        this.i_value[index] = $event
        this.value_change(this.i_value)
        //console.log("comp update", this.aspect.name, $event, this.i_value)
        // todo here we want to eventually update the title, its nice in lists
        // otherwise we could just sync value
        // v-bind:value.sync="i_value[index]"
        // ... no idea how/where it emits up
        //this.$emit("update:value",)
      }
    }
  }
</script>

<style scoped>

</style>


CompositeAspect
