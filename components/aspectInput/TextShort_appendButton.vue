<template lang="pug">
  div(v-if="edit")
    v-text-field(
      outline
      :label="aspect.name"
      placeholder=" "
      v-model="i_value"
      :append-outer-icon="icon"
      @click:append-outer="click_outer"
      @input="value_change($event)")
  div(v-else)
    v-text-field(
      readonly solo flat
      :label="aspect.name"
      :value="i_value"
      @input="value_change($event)")
</template>

<script>
  import AspectMixin from "./AspectMixin";

  export default {
    name: "TextShort_appendButton",
    mixins: [AspectMixin],
    props: {
      icon: {
        type: String,
        required: true
      },
      id: {}
    },
    methods: {
      click_outer() {
        console.log("clicky")
        this.$emit(this.icon, this.id);
      }
    }
  }
</script>

<style scoped>

</style>
