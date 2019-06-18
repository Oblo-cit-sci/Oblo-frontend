<template lang="pug">
  div
    div(v-if="edit")
      v-textarea(
        outline
        single-line
        auto-grow
        :counter="counter"
        v-model="i_value"

        :append-outer-icon="clearIcon"
        @click:append-outer="$emit('entryAction', {action: 'clear'})"

        @input="value_change($event)")
    div(v-else)
      v-textarea(
        readonly
        outline
        single-line
        flat
        auto-grow

        :append-outer-icon="clearIcon"
        @click:append-outer="$emit('entryAction', {action: 'clear'})"

        :value="i_value")

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
