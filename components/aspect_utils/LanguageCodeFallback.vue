<template lang="pug">
  LanguageChip(:language_code="actual_lang" :x_small="x_small", :small="small")
</template>

<script>
import LanguageChip from "~/components/language/LanguageChip";
export default {
  name: "LanguageCodeFallback",
  components: {LanguageChip},
  props: {
    intended_lang: String,
    actual_lang: String,
    "x_small": Boolean,
    small: Boolean
  }
}
</script>

<style scoped>

</style>
