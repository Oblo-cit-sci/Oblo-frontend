<template lang="pug">
  v-chip.mt-1.ml-1(:style="{opacity:'70%'}" color="yellow" :small="small" :x-small="x_small") {{this.$t(`lang.${language_code}`)}}
</template>

<script>
export default {
  name: "LanguageChip",
  props: {
    language_code: String,
    "x_small": Boolean,
    small: Boolean
  }
}
</script>

<style scoped>

</style>
