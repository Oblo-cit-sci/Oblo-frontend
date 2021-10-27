import LanguageMixin from "~/components/LanguageMixin";
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";
import ExportMixin from "~/components/global/ExportMixin"
import TemplateHelperMixin from "~/components/templates/TemplateHelperMixin"

export default {
  name: "EntryFetchMixin",
  mixins: [LanguageMixin, TriggerSnackbarMixin, ExportMixin, TemplateHelperMixin],
  methods: {
    async guarantee_entry(entry_uuid, entry_access_key = null) {
      if (this.$store.getters["entries/has_full_entry"](entry_uuid)) {
        return Promise.resolve(this.$store.getters["entries/get_entry"](entry_uuid))
      } else {
        try {
          let entry_response = null
          if (!entry_access_key) {
            entry_response = await this.$api.entry.get(entry_uuid)
          } else {
            entry_response = await this.$api.entry.get_shared(entry_uuid, entry_access_key)
          }
          // const entry_response = await this.$api.entry.get(entry_uuid)
          if (entry_response.status === 200) {
            const entry = entry_response.data.data
            // todo: maybe do more stuff. preparing?
            this.$store.commit("entries/save_entry", entry)
            await this.complete_language_domains(entry.domain, entry.language)
            await this.guarantee_template_code_of_version(entry)
            return Promise.resolve(entry)
          } else {
            return Promise.reject(entry_response)
          }
        } catch (e) {
          return Promise.reject(e)
        }
      }
    },
    async guarantee_templates_codes(entries) {
      const missing_domain_lang_entries = this.$store.getters["templates/get_missing_templates"](entries)
      console.log("missing slugs", missing_domain_lang_entries)
      const missing_domains = missing_domain_lang_entries.map(dom_lang => dom_lang.domain)
      console.log("domains", missing_domains)
      // TODO CALL get_entries_by_slugs
      // if (missing_domains.length > 0) {
      //   const {data: resp} = await this.$api.domain.multi_d_get_codes_templates(Array.from(missing_domains), this.$store.getters.ui_language)
      //   await this.$store.dispatch("templates/add_templates_codes", resp.data)
      //   return resp.data
      // }
      return []
    },
    async download_entries(uuids) {
      const response = await this.$api.entries.download(uuids)
      this.download_csv(response.data, "entries_download")
    },

  }
}
