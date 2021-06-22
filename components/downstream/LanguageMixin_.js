export default {
  name: "LanguageMixin_",
  methods: {
    async complete_language_domains(domain, language) {
      // console.log("completing...", domain, language)

      if (this.$store.getters["domain/has_lang_domain_data"](domain, language)) {
        // console.log("got it already", domain, language)
        return Promise.resolve()
      }
      return this.init_specifics(domain, language)
    },
  }
}
