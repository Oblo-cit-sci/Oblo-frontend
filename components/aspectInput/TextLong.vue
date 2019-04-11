<template lang="pug">
  div
    div {{aspect.description}}
    v-textarea(
      outline
      :counter="counter"
      :label="aspect.name"
      placeholder=" "
      v-model="i_value"
      :rules="[rules.required]"
      persistent-hint=true
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
        rules: {
          required: value => !!value || 'Required'
        }
      }
    },
    created() {
      console.log(this.aspect.attr.hasOwnProperty("max"));
      if(this.aspect.hasOwnProperty("attr") && this.aspect.attr.hasOwnProperty("max")) {
        this.counter =  this.aspect.attr.max;
      }
    },
    computed: {
    }
  }
</script>

<style scoped>

</style>
