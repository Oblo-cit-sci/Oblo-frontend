<template lang="pug">
  div
    v-text-field(
      outline
      single-line
      :readonly="readOnly"
      :disabled="disabled"
      :placeholder="aspect.attr.placeholder"
      :hint="hint"
      :rules="rules"
      :prependIcon="prependIcon"
      @click:prepend="$emit('clickPrepend')"

      :append-outer-icon="clearIcon"
      @click:append-outer="$emit('entryAction', {action: 'clear'})"

      :value="i_value"
      @input="value_change($event)")
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import TextfieldAspect from "../TextfieldAspect";

  export default {
    name: "TextShortAspect",
    mixins: [AspectMixin, TextfieldAspect],
    props: {
        // probably not used atm
      prependIcon: String
    },
  }
</script>

<style scoped>

</style>
