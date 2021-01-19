<template lang="pug">
  div
    h3 {{$t("comp.entry_validation.h1")}}
    div(v-if="has_missing")
      b {{$t("comp.entry_validation.has_missing")}}
      div {{$t("comp.entry_validation.has_missing_t")}}
    div(v-else) {{$t("comp.entry_validation.ok")}}
    .required_aspect.red--text(v-for="(aspect, i) in missing_aspects" :key="i") {{validation(aspect)}}
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
    missing_aspects() {
      return this.$_.map(
        this.$_.pickBy(this.aspects_set, a => !a),
        (_, a_name) => this.aspects.find(a => a.name === a_name))
    },
    has_missing() {
      return this.missing_aspects.length > 0
    }
  },
  methods: {
    validation(aspect) {
      return this.$t("comp.entry_validation.msgs.missing", {aspect_label: aspect.label})
    }
  }
}
</script>

<style scoped>

</style>
