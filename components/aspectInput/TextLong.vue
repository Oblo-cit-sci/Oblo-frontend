<template lang="pug">
  div
    Title_Description(v-bind="title_description()")
    div(v-if="edit")
      v-textarea(
        outline
        single-line
        auto-grow
        :counter="counter"
        v-model="i_value"
        @input="value_change($event)")
    div(v-else)
      v-textarea(
        readonly outline single-line flat auto-grow
        :value="i_value")
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import Title_Description from "../Title_Description";


  export default {
    components: {Title_Description},
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
