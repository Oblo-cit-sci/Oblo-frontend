<template lang="pug">
  div
    Title_Description(v-bind="title_description()")
    div(v-if="edit")
      v-text-field(
        outline single-line
        placeholder=" "
        v-model="i_value"
        @input="value_change($event)")
    div(v-else)
      v-text-field(
        readonly outline single-line flat
        :value="i_value"
        @input="value_change($event)")
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import Title_Description from "../Title_Description";

  export default {
    name: "TextShort",
    components: {Title_Description},
    mixins: [AspectMixin],
  }
</script>

<style scoped>

</style>
