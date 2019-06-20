<template lang="pug">
  div
    div(v-if="edit")
      v-text-field(
        outline
        single-line
        hide-details
        :disabled="disabled"
        :placeholder="aspect.attr.placeholder"
        v-model="i_value"

        :prependIcon="prependIcon"
        @click:prepend="$emit('clickPrepend')"

        :append-outer-icon="clearIcon"
        @click:append-outer="$emit('entryAction', {action: 'clear'})"

        @input="value_change($event)")
    div(v-else)
      v-text-field(
        readonly
        outline
        single-line
        flat
        hide-details
        :value="i_value"
        :prependIcon="prependIcon"
        @click:prepend="$emit('clickPrepend')"

        :append-outer-icon="clearIcon"
        @click:append-outer="$emit('entryAction', {action: 'clear'})"

        @input="value_change($event)")
</template>

<script>
  import AspectMixin from "./AspectMixin";

  export default {
    name: "TextShort",
    mixins: [AspectMixin],
    props: {
      prependIcon: String
    },

  }
</script>

<style scoped>

</style>
