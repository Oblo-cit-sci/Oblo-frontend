<template lang="pug">
  v-chip.mt-1.ml-1(:style="{opacity:'70%'}" color="yellow" :small="small" :x-small="x_small") {{language_text}}
</template>

<script>
export default {
  name: "LanguageChip",
  props: {
    language_code: String,
    full_name: {
      type: Boolean,
      default: true
    },
    x_small: Boolean,
    small: Boolean
  },
  computed: {
    language_text() {
      if (this.full_name) {
        return this.$t(`lang.${this.language_code}`)
      } else {
        return this.language_code
      }
    }
  }
}
</script>

<style scoped>

</style>
