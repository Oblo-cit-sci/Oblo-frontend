<template>

</template>

<script>
export default {
  name: "DomainLanguageMixin",
  methods: {
    ui_lang_domain_data(domain_name) {
      return this.lang_domain_data(domain_name, this.$store.getters["user/settings"].ui_language)
    },
    lang_domain_data(domain_name, language_code) {
      const domain_data = this.$store.getters["domain/domain_by_name"](domain_name)
      if (domain_data) {
        // also this can result undefined
        return domain_data[language_code]
      }
    }
  }
}
</script>

<style scoped>

</style>
