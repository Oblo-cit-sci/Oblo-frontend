export default {
  name: "TemplateHelperMixin",
  created() {
    if (!this.template) {
      console.log("TemplateHelperMixin.WARNING: no template in component")
    }
  },
  methods: {
    get_reference_slugs() {
      return Array.from(this.template.entry_refs.reduce((slug_set, ref) => {
        slug_set.add(ref.dest_slug)
        return slug_set
      }, new Set()).values())
    },
    has_template_in_lang(slug, language) {
      return this.$store.getters["templates/has_template_in_lang"](slug, language)
    },
    has_code_in_lang(slug, language) {
      return this.$store.getters["templates/has_code_in_lang"](slug, language)
    },
    has_slug_in_lang(slug, language) {
      return this.$store.getters["templates/has_slug_in_lang"](slug,  language)
    },
    // todo this maybe somewhere else
    async guarantee_slugs_in_language(slugs, language) {
      const missing = slugs.filter(slug => !this.has_slug_in_lang(slug,  language))
      const {data} = await this.$api.entries.get_entries_by_slugs(missing, language)
      const entries = data.data
      await this.$store.dispatch("templates/add_templates_codes", entries)
      return entries
    }
  }
}
