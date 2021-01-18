<template lang="pug">
  div
    h3 {{$t("comp.entry_validation.h1")}}
    div(v-if="has_missing")
      b {{$t("comp.entry_validation.has_missing")}}
      div {{$t("comp.entry_validation.has_missing_t")}}
    div(v-else) {{$t("comp.entry_validation.ok")}}
    .required_aspect.red--text(v-for="(aspect, i) in missing" :key="i") {{aspect}}
</template>

<script>
export default {
  name: "AspectSetValidation",
  props: {
    aspects: {
      type: Array,
      required: true
    },
    aspects_set: {
      type: Object,
      required: true
    }
  },
  computed: {
    missing() {
      return Object.keys(this.$_.pickBy(this.aspects_set, a => !a))
    },
    has_missing() {
      return this.missing.length > 0
    }
  }
}
</script>

<style scoped>

</style>
