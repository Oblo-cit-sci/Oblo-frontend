<template lang="pug">
  div
    v-text-field(
      :readonly="readOnly"
      outline
      single-line
      :hide-details="hideDetails"
      :disabled="disabled"
      :placeholder="aspect.attr.placeholder"
      :hint="hint"
      :rules="rules"

      :prependIcon="prependIcon"
      @click:prepend="$emit('clickPrepend')"

      :append-outer-icon="clearIcon"
      @click:append-outer="$emit('entryAction', {action: 'clear'})"

      @focus="$emit('focus')"
      :value="i_value"
      @input="value_change($event)")
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import TextfieldAspect from "../TextfieldAspect";

  export default {
    name: "TextShort",
    mixins: [AspectMixin, TextfieldAspect],
    props: {
      prependIcon: String
    },
  }
</script>

<style scoped>

</style>
