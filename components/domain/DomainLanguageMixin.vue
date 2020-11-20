<template>

</template>

<script>
export default {
  name: "DomainLanguageMixin",
  methods: {
    ui_lang_domain_data(domain_name) {
      console.log(this.$store.getters["user/settings"].domain_language)
      return this.lang_domain_data(domain_name, this.$store.getters["user/settings"].domain_language)
    },
    lang_domain_data(domain_name, language_code) {
      return this.$store.getters["domain/lang_domain_data"](domain_name, language_code)
    }
  }
}
</script>

<style scoped>

</style>
