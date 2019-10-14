<template lang="pug">
  div
    v-text-field(v-if="!readOnly"
      outlined
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

      :value="value"
      @input="value_change($event)")
    // dummy readOnly, but I dont like that you can still focus it...
    v-text-field(v-else
      :value="value"
      readonly
      hide-details)
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
