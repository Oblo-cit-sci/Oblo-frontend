<template lang="pug">
  div
    v-text-field(v-if="!readOnly"
      outlined
      single-line
      :readonly="readOnly"
      :disabled="disabled"
      :placeholder="aspect.attr.placeholder"
      :hide-details="hide_details"
      :hint="hint"
      :rules="rules"
      :prependIcon="prependIcon"
      :type="aspect.attr.component_type === 'password' ? 'password' : 'text'"
      @click:prepend="$emit('clickPrepend')"
      @keydown="keydown($event)"
      :append-outer-icon="clearIcon"
      @click:append-outer="$emit('aspectAction', {action: 'clear'})"
      :value="value"
      @input="update_value($event)"
      @update:error="$emit('update:error', $event)")
    p.body-1.readonly-aspect(v-else) {{value}}
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
    methods: {
      keydown(keyEvent) {
        if(keyEvent.keyCode === 13 && this.extra.enter_pressed) {
          this.$emit("aspectAction", "enter_pressed")
        }
      }
    }
  }
</script>

<style scoped>

</style>
