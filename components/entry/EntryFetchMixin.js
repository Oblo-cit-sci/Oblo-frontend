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
      const all_domains = entries.reduce((domain_set, entry) => {
        domain_set.add(entry.domain)
        return domain_set
      }, new Set())
      const {data:resp} = await this.$api.entries.get_codes_templates(Array.from(all_domains), this.$store.getters.ui_language)
      await this.$store.dispatch("templates/add_templates_codes", resp.data)
    }
  }
}
