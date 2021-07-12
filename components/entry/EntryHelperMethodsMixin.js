export default {
  name: "EntryHelperMethodsMixin",
  methods: {
    get_template(entry) {
      const lang = this.$store.getters.domain_language
      return this.$store.getters["templates/entry_type"](entry.template.slug, lang)
    }
  }
}
