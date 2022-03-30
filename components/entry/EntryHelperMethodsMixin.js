export default {
  name: "EntryHelperMethodsMixin",
  methods: {
    get_template(entry) {
      const lang = this.$store.getters.domain_language
      // console.log("getting template...", entry,  lang)
      return this.$store.getters["templates/entry_type"](entry.template.slug, lang)
    },
    get_template_of_version(entry) {
      // console.log("checking if outdated version exists")
      return this.$store.getters["templates/entry_type_version"](entry.template.slug, entry.language, entry.template_version)
    }
  }
}
