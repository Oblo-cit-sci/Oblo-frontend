<template lang="pug">
  LanguageChip(:language_code="actual_lang")
</template>

<script>
import LanguageChip from "~/components/language/LanguageChip";
export default {
  name: "LanguageCodeFallback",
  components: {LanguageChip},
  props: {
    intended_lang: String,
    actual_lang: String
  }
}
</script>

<style scoped>

</style>
