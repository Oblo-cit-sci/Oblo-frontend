<template lang="pug">
  div
    v-text-field(
      outline
      :label="aspect.name"
      placeholder=" "
      v-model="i_value"
      @input="value_change($event)")
</template>

<script>
 import AspectMixin from "./AspectMixin";

  export default {
    name: "TextShort",
   mixins: [AspectMixin],

  }
</script>

<style scoped>

</style>
