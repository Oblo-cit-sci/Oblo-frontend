export default {
  name: "LanguageMxin",
  methods: {
    /**
     *
     * @param domain one domain or null, which considers all domain
     * @param language the language required
     */
    async complete_language_domains(domain, language) {
      // console.log("completing", domain, language)
      if (this.$store.getters["domain/has_lang_domain_data"](domain, language)) {
        console.log("got it already")
        return Promise.resolve()
      }
      return this.init_specifics(domain, language)
    },
    async init_specifics(domain, language) {
      const {data} = await this.$api.init_data(domain, language)
      const domains_data = data.data.domains
      console.log(domains_data)
      this.$store.commit("domain/set_domains", {domains_data, language})
      console.log(data.data.templates_and_codes)
      await this.$store.dispatch("set_templates_codes", data.data.templates_and_codes)
      return Promise.resolve()
    },
  }
}
