import LanguageMixin from "~/components/LanguageMixin";

export default {
  name: "EntryFetchMixin",
  mixins: [LanguageMixin],
  methods: {
    async guarantee_entry(entry_uuid) {
      if (this.$store.getters["entries/has_full_entry"](entry_uuid)) {
        return Promise.resolve(this.$store.getters["entries/get_entry"](entry_uuid))
      } else {
        const entry_response = await this.$api.entry.get_(entry_uuid)
        if (entry_response.status === 200) {
          const entry = entry_response.data.data
          // todo: maybe do more stuff. preparing?
          this.$store.commit("entries/save_entry", entry)
          return Promise.resolve(entry)
        } else {
          return Promise.reject(entry_response)
        }
      }
    },
    async guarantee_templates_codes(entries) {
      const missing_domain_lang_entries = this.$store.getters["templates/get_missing_domain_language"](entries)
      const missing_domains = missing_domain_lang_entries.map(dom_lang => dom_lang.domain)
      if (missing_domains.length > 0) {
        const {data: resp} = await this.$api.entries.get_codes_templates(Array.from(missing_domains), this.$store.getters.ui_language)
        await this.$store.dispatch("templates/add_templates_codes", resp.data)
      }
    }
  }
}
