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

      :value="value"
      @input="emit('update_value', $event)")
  div(v-else)
    p(class="body-1 readonly-aspect") {{value}}
</template>

<script>
  import AspectMixin from "./AspectMixin";


  export default {
    mixins: [AspectMixin],
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
