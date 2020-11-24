<template lang="pug">
  v-chip.mt-1.ml-1(:style="{opacity:'70%'}" color="yellow") {{language_code}}
</template>

<script>
export default {
  name: "LanguageChip",
  props: {
    language_code: String
  }
}
</script>

<style scoped>

</style>
