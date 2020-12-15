import {DOMAIN_LANGUAGE, UI_LANGUAGE} from "~/lib/consts";
import FilterMixin from "~/components/FilterMixin";

export default {
  name: "LanguageMxin",
  mixins: [FilterMixin],
  computed: {

  },
  methods: {
    async change_language(language, update_settings = true, domain_language = null) {
      if (!domain_language) {
        domain_language = language
      }
      let domain = this.$store.getters["domain/act_domain_name"] // undefined for non-domain
      // todo maybe can go into a mixin, if there are other settings for the language
      this.complete_language_domains(domain, domain_language).then(() => {
        if (update_settings)
          this.set_settings_value(DOMAIN_LANGUAGE, domain_language)
      })
      // console.log("check have?", language, this.loaded_ui_languages.includes(language))
      if (!this.$i18n.availableLocales.includes(language)) {
        try {
          const {data} = await this.$api.language.get_component("fe", language)
          this.$i18n.setLocaleMessage(language, data)
        } catch (e) {
          if (e.response.status === 404) {
            console.log("frontend not available in the language:", language)
            return
          }
        }
      }
      this.$api.axios.defaults.headers.common["Accept-Language"] = language
      if (update_settings)
        this.set_settings_value(UI_LANGUAGE, language)
      this._i18n.locale = language
      // UPDATE SEARCH CONFIG

      this.$store.commit("search/replace_in_act_config",
        Object.assign(this.language_filter_config(),
          {
            value: [language],
            text: this.$t("lang."+language)
          }))
    },
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
      const {data} = await this.$api.basic.init_data(domain, language)
      const domains_data = data.data.domains
      console.log(domains_data)
      this.$store.commit("domain/set_domains", {domains_data, language})
      console.log(data.data.templates_and_codes)
      await this.$store.dispatch("templates/add_templates_codes", data.data.templates_and_codes)
      return Promise.resolve()
    },
    filter_language_items(language_items, keep_codes) {
      return this.$_.filter(language_items, i => keep_codes.includes(i.value))
    },
    get_language_options(codes) {
      if(!codes) {
        codes = this.$store.getters["available_languages"]
      }
      return this.$store.getters["templates/code"]("languages").values.list.filter(v => codes.includes(v.value))
    }
  }
}