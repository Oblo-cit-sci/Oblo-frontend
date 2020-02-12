<template lang="pug">
  div(v-if="!readOnly")
    v-textarea(
      outlined
      single-line
      :readonly="readOnly"
      :disabled="disabled"
      auto-grow
      :counter="counter"
      :append-outer-icon="clearIcon"
      @click:append-outer="$emit('entryAction', {action: 'clear'})"

      @input="$emit('value_change', $event)")
  div(v-else)
    p(class="body-1 readonly-aspect") {{value}}
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import AspectComponentMixin from "./AspectComponentMixin";
  import TextfieldAspect from "../TextfieldAspect";


  export default {
    mixins: [AspectComponentMixin, TextfieldAspect],
    name: "TextLongAspect",
    data() {
      return {
        counter:false,
      }
    },
    created() {
      //console.log(this.aspect.attr.hasOwnProperty("max"));
      if(this.aspect.hasOwnProperty("attr") && this.aspect.attr.hasOwnProperty("max")) {
        this.counter =  this.aspect.attr.max;
      }
    },
  }
</script>

<style scoped>

</style>
