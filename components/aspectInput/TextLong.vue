<template lang="pug">
  div
    v-textarea(
      outline
      single-line
      :readonly="readOnly"
      :disabled="disabled"
      auto-grow
      :counter="counter"
      :append-outer-icon="clearIcon"
      @click:append-outer="$emit('entryAction', {action: 'clear'})"
      @input="value_change($event)")
</template>

<script>
  import AspectMixin from "./AspectMixin";


  export default {
    mixins: [AspectMixin],
    name: "TextLong",
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
