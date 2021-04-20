import {DOMAIN_LANGUAGE, NO_DOMAIN, UI_LANGUAGE, VALUE} from "~/lib/consts";
import FilterMixin from "~/components/FilterMixin";
import {pack_value} from "~/lib/aspect";
import SettingsChangeMixin from "~/components/global/SettingsChangeMixin";
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";
import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
import {is_standalone} from "~/lib/pwa"

export default {
  name: "LanguageMxin",
  mixins: [FilterMixin, SettingsChangeMixin, TriggerSnackbarMixin, PersistentStorageMixin],
  computed: {
    default_language() {
      return this.$nuxt.context.env.DEFAULT_LANGUAGE
    },
  },
  methods: {
    async guarantee_default_lang_language_names() {
      if (!this.$i18n.messages.langs) {
        const {data: resp_data} = await this.$api.language.get_language_names(this.default_language)
        this.$i18n.mergeLocaleMessage(this.default_language, resp_data)
      }
    },
    async change_language(language, update_settings = true, domain_language = null, snackbar = false) {
      if (!domain_language) {
        domain_language = language
      }
      let domain = this.$store.getters["domain/act_domain_name"] // undefined for non-domain
      // todo maybe can go into a mixin, if there are other settings for the language
      // if (domain === NO_DOMAIN) {
      //   const {data} = await this.$api.domain.overview(language)
      //   // console.log(data)
      //   await this.$store.dispatch("domain/add_overviews", data.data)
      // }
      await this.change_domain_language(domain_language, update_settings, language !== domain_language)
      // console.log("check have?", language, this.loaded_ui_languages.includes(language))
      if (!this.$i18n.availableLocales.includes(language)) {
        try {
          const {data} = await this.$api.language.get_component("fe", [language])
          this.$i18n.setLocaleMessage(language, data[language])
          if (is_standalone()) {
            this.persist_messages()
          }
        } catch (e) {
          if (e.response.status === 404) {
            console.log("frontend not available in the language:", language)
            return
          }
        }
      }
      if (language === this.default_language) {
        await this.guarantee_default_lang_language_names()
      }
      this.$api.axios.defaults.headers.common["Accept-Language"] = language
      if (update_settings && this.get_ui_language() !== language) {
        this.set_settings_value(UI_LANGUAGE, language)
      }
      this._i18n.locale = language
    },
    async change_domain_language(domain_language, update_settings = true, snackbar = true) {
      let domain = this.$store.getters["domain/act_domain_name"] // undefined for non-domain

      this.complete_language_domains(domain, domain_language).then(() => {
        // console.log("switching domain-lang", domain_language)
        this.$store.commit("domain/set_act_lang_domain_data", {
          domain_name: this.$store.getters["domain/act_domain_name"],
          language: domain_language
        })
        if (is_standalone()) {
          this.persist_domains()
          this.persist_templates()
        }
        if (update_settings) {
          this.set_settings_value(DOMAIN_LANGUAGE, domain_language)
        }

        // UPDATE SEARCH CONFIG
        this.$store.commit("search/replace_in_act_config",
          Object.assign(this.language_filter_config(),
            {
              value: pack_value([domain_language])
            }))

        if (snackbar) {
          this.ok_snackbar(this.$t("comp.language_select.domain_language_changed", {language_name: this.t_lang(domain_language)}))
        }
      })
    },
    /**
     *
     * @param domain one domain or null, which considers all domain
     * @param language the language required
     */
    async complete_language_domains(domain, language) {
      // console.log("completing...", domain, language)
      if (this.$store.getters["domain/has_lang_domain_data"](domain, language)) {
        // console.log("got it already")
        return Promise.resolve()
      }
      return this.init_specifics(domain, language)
    },
    async init_specifics(domains, language) {
      if (!Array.isArray(domains)) {
        domains = [domains]
      }
      if (!this.$store.getters["domain/has_lang_domain_data"](NO_DOMAIN, language)) {
        domains.push(NO_DOMAIN)
      }
      const {data} = await this.$api.basic.init_data(domains, language)
      // todo this also gets all the messages
      const domains_data = data.data.domains
      this.$store.commit("domain/add_domains_data", domains_data)
      // console.log(data.data.templates_and_codes)
      await this.$store.dispatch("templates/add_templates_codes", data.data.templates_and_codes)
      return Promise.resolve()
    },
    filter_language_items(language_items, keep_codes) {
      return this.$_.filter(language_items, i => keep_codes.includes(i.value))
    },
    get_language_options(codes) {
      if (!codes) {
        codes = this.$store.getters["available_languages"]
      }
      return codes.map(c => ({value: c, "text": this.$t(`lang.${c}`)}))
    },
    t_lang(lang_code) {
      return this.$t(`lang.${lang_code}`)
    },
    get_ui_language() {
      return this.$store.getters.ui_language
    },
    get_domain_language() {
      return this.$store.getters.domain_language
    }
  }
}
