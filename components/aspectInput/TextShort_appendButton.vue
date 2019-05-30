<template lang="pug">
  div(v-if="edit")
    div {{aspect.name}}
    v-text-field(
      outline
      single-line
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
      },
      id: {}
    },
    methods: {
      click_outer() {
        this.$emit(this.icon, this.id);
      }
    }
  }
</script>

<style scoped>

</style>
