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
      :type="aspect.attr.component_type === 'password' ? 'password' : 'text'"
      @click:prepend="$emit('clickPrepend')"

      :append-outer-icon="clearIcon"
      @click:append-outer="$emit('aspectAction', {action: 'clear'})"

      :value="value"
      @input="update_value($event)"
      @update:error="$emit('update:error', $event)")
    p(v-else
      class="body-1 readonly-aspect") {{value}}
</template>

<script>
  import TextfieldAspect from "../TextfieldAspect";
  import AspectComponentMixin from "./AspectComponentMixin";

  export default {
    name: "TextShortAspect",
    mixins: [AspectComponentMixin, TextfieldAspect],
    props: {
        // probably not used atm
      prependIcon: String
    },
  }
</script>

<style scoped>

</style>
