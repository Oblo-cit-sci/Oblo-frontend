<template lang="pug">
  div(v-if="edit")
    v-text-field(
      outline
      :label="aspect.name"
      placeholder=" "
      v-model="i_value"
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
    name: "UrlAspect",
    mixins: [AspectMixin],
  }
</script>

<style scoped>

</style>
