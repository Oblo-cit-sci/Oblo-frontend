import LanguageMixin from "~/components/LanguageMixin";
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";
import ExportMixin from "~/components/global/ExportMixin"
import {DOWNLOADING, LANGUAGE, NOT_DOWNLOADING, TEMPLATE} from "~/lib/consts"
import SlugEntryFetcher from "~/components/templates/SlugEntryFetcher";

export default {
  name: "EntryFetchMixin",
  mixins: [LanguageMixin, TriggerSnackbarMixin, ExportMixin, SlugEntryFetcher],
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
    async download_entries(uuids, config) {
      // const meta_only  = config.select_data === METADATA
      console.log(config)
      // todo this whole stuff is not elegant. it should basically do the same as search-filter...
      config.entries_uuids = uuids
      this.download_status = DOWNLOADING
      const search_query = {
        required: []
      }
      if(config.template) {
        search_query.required.push({
          name:TEMPLATE,
          value: [config.template]
        })
        delete config.template
      }
      if(config.language) {
        search_query.required.push({
          name:LANGUAGE,
          value: {
            language: [config.language]
          }
        })
        delete config.language
      }
      config.search_query = search_query
      this.$api.entries.download(config).then(response => {
        // if (response.headers["content-type"] === "application/zip") {
        //   this.download_zip(response.data, response.request.getResponseHeader('Content-Disposition'))
        // }
        // else {
        this.download_csv(response.data, "entries_download")
        // }
        this.download_status = NOT_DOWNLOADING
      })
    },

  }
}
