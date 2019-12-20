<template lang="pug">
  div
    v-text-field(v-if="!readOnly"
      outlined
      single-line
      :readonly="readOnly"
      :disabled="disabled"
      :placeholder="aspect.attr.placeholder"
      hide-details
      :hint="hint"
      :rules="rules"
      :prependIcon="prependIcon"
      @click:prepend="$emit('clickPrepend')"

      :append-outer-icon="clearIcon"
      @click:append-outer="$emit('entryAction', {action: 'clear'})"

      :value="value"
      @input="value_change($event)")
    p(v-else
      class="body-1 readonly-aspect") {{value}}
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
