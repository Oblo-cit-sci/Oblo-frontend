<template lang="pug">
  div
    v-text-field("outline" :label="aspect.name"  v-model="i_value" @input="value_change($event)")
    div {{i_value}}
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
