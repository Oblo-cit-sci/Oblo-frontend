export default {
  name: "ApiHelperMixin",
  methods: {
    async guarantee_domain_language(domain_name, language) {
      if (this.$store.getters["domain/has_lang_domain_data"](domain_name, language)) {
        return
      } else {
        const domain_data = this.$store.getters["domain/has_lang_domain_data"](domain_name)
        if (domain_data.languages.includes(language)) {
          const received_data = await this.$api.domain.info(domain_name, language)
          console.log(received_data)
        }
      }
    }
  }
}
