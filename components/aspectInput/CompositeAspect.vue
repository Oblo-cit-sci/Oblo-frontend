<template lang="pug">
  div
    div(v-for="(comp_type, index) in aspect.components" :key="index")
      Aspect(
        :aspect="comp_type"
        :value="i_value[index]"
        v-on:update:value="update_value($event, index)"
        :edit="true"
        :mode="mode"
        :extra="comp_extras"
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
    created() {
      console.log("comp created", this.i_value)
      if(!this.i_value) {

      }
      //aspect_wrapped_default_value(this.aspect.options[index])
    },
    methods: {
      update_value($event , index) {
        this.i_value[index] = $event
        this.value_change(this.i_value)
      }
    },
    computed: {
      comp_extras() {
        console.log(this.aspect.name, this.extra, this.aspect_ref)
        this.extra = this.extra || {}
        this.aspect_ref = this.aspect_ref || {}
        return Object.assign(this.extra, {aspect_ref: this.aspect_ref})
      }
    },
    watch: {
      // unfortunately not triggered...
      /*i_value(val) {
        console.log("comp ival cahnge", val)
        if(!this.edit)
          console.log("composite value changed from above", val)
      }*/
      value(new_val) {
        console.log("COMP val change", new_val)
        this.i_value = new_val;
      },
    }
  }
</script>

<style scoped>

</style>


CompositeAspect
