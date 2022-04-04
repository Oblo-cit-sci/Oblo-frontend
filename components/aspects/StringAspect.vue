<template lang="pug">
  div
    div(v-if="!is_view_mode")
      v-text-field(v-if="component==='v-text-field'"
        outlined
        single-line
        :value="value"
        @input="update_value($event)"
        :disabled="disabled"
        :placeholder="attr.placeholder"
        @update:error="$emit('update:error', $event)"
        :prependIcon="prependIcon"
        @click:prepend="$emit('aspectAction',{action:'clickPrepend'})"
        :append-outer-icon="clearIcon"
        @click:append-outer="$emit('aspectAction', {action: 'clear'})"
        :hint="hint"
        :hide-details="hide_details"
        :rules="text_rules"
        :type="attr.component_type === 'password' ? 'password' : 'text'"
        @keydown="keydown($event)"
        :auto-grow="auto_grow"
        :counter="counter")
      v-textarea(v-else
        :is="component"
        outlined
        single-line
        :value="value"
        @input="update_value($event)"
        :disabled="disabled"
        :placeholder="attr.placeholder"
        @update:error="$emit('update:error', $event)"
        :prependIcon="prependIcon"
        @click:prepend="$emit('aspectAction',{action:'clickPrepend'})"
        :append-outer-icon="clearIcon"
        @click:append-outer="$emit('aspectAction', {action: 'clear'})"
        :hint="hint"
        :hide-details="hide_details"
        :rules="rules"
        :type="attr.component_type === 'password' ? 'password' : 'text'"
        @keydown="keydown($event)"
        :auto-grow="auto_grow"
        :counter="counter")
    p.body-1.readonly-aspect.break_word(v-else) {{value}}
</template>

<script>
import AspectComponentMixin from "./AspectComponentMixin";
import {EDIT} from "~/lib/consts"

export default {
  name: "StringAspect",
  mixins: [AspectComponentMixin],
  props: {
    // not used by anything I think
    prependIcon: String
  },
  methods: {
    keydown(keyEvent) {
      if (keyEvent.keyCode === 13 && this.extras.enter_pressed) {
        this.$emit("aspectAction", "enter_pressed")
      }
    }
  },
  computed: {
    component() {
      // return "v-text-field"
      if ((this.attr.max || 0) > 100) {
        return "v-textarea"
      } else {
        return "v-text-field"
      }
    },
    counter() {
      if (this.component === "v-textarea") {
        return this.aspect.attr.max || false;
      }
    },
    text_rules() {
      return this.$_.concat([(v) => {
        // console.log(v)
        if(v) {
          if (this.attr.min && v.length < this.attr.min) {
            //`Must be at least ${this.attr.min} characters`
            return this.$t("comp.string_asp.min_rule",{number: this.attr.min})
          }
          if (this.attr.max && v.length > this.attr.max) {
            //`Must be no more than ${this.attr.max} characters`
            return this.$t("comp.string_asp.max_rule",{number: this.attr.max})
          }
          return true
        }
        return true
        // v && this.attr.max && v.length < this.attr.max || "nope"
      }])
    },
    auto_grow() {
      return this.component === "v-textarea"
    },
    clearIcon() {
      return ((this.extra.listitem && this.mode === EDIT) || false) ? "mdi-close" : undefined //this.extra
    },
  }
}
</script>

<style scoped>
.break_word {
  word-break: break-word;
}
</style>
