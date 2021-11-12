import {DOMAIN_LANGUAGE, NO_DOMAIN, UI_LANGUAGE, VALUE} from "~/lib/consts";
import {pack_value} from "~/lib/aspect";
import SettingsChangeMixin from "~/components/global/SettingsChangeMixin";
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";
import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
import EnvMixin from "~/components/global/EnvMixin";
import LanguageMixin_ from "~/components/downstream/LanguageMixin_";

export default {
  name: "LanguageMxin",
  mixins: [SettingsChangeMixin, TriggerSnackbarMixin, PersistentStorageMixin, EnvMixin, LanguageMixin_],
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
      // let domain = this.$store.getters["domain/act_domain_name"] // undefined for non-domain
      // todo maybe can go into a mixin, if there are other settings for the language
      // if (domain === NO_DOMAIN) {
      //   const {data} = await this.$api.domain.overview(language)
      //   // console.log(data)
      //   await this.$store.dispatch("domain/add_overviews", data.data)
      // }
      // console.log("change-lang", language)
      await this.change_domain_language(domain_language, update_settings, language !== domain_language)
      // console.log("check have?", language, this.$i18n.availableLocales.includes(language))
      if (!this.$i18n.availableLocales.includes(language)) {
        try {
          const {data} = await this.$api.language.get_component("fe", [language])
          this.$i18n.setLocaleMessage(language, data[language])
          if (this.is_standalone) {
            await this.persist_messages()
          }
        } catch (e) {
          if (e.response.status === 404) {
            console.log("frontend not available in the language:", language)
            return
          }
        }
      }

      let user_guide_url = this.$store.getters["translate/user_guide_link"](language)
      if (!user_guide_url) {
        const user_guide_url_data = await this.$api.language.user_guide_url(language)
        user_guide_url = user_guide_url_data.data.url
        this.$store.commit("translate/add_user_guide_link", {language_code: language, url: user_guide_url})
      }
      this.$store.commit("app/set_menu_to", {name: "user_guide", to: user_guide_url})

      if (language === this.default_language) {
        await this.guarantee_default_lang_language_names()
      }
      this.$api.axios.defaults.headers.common["Accept-Language"] = language
      if (update_settings && this.get_ui_language() !== language) {
        this.set_settings_value(UI_LANGUAGE, language)
      }
      this._i18n.locale = language
    },
    async get_domain_overviews(language) {
      const requires_overviews = !this.$store.getters["domain/get_requested_overviews"]().has(language)
      // console.log(this.$store.getters["domain/get_requested_overviews"](), language)
      if (requires_overviews) {
        const {data} = await this.$api.domain.overviews(language)
        this.$store.commit("domain/add_domains_data", data.data)
      }
    },
    async change_domain_language(domain_language, update_settings = true, snackbar = true) {
      let domain = this.$store.getters["domain/act_domain_name"] // undefined for non-domain
      // console.log("change domain lang", domain, domain_language)

      await this.complete_language_domains(domain, domain_language)

      // console.log("switching domain-lang", domain_language)
      await this.$store.dispatch("domain/set_act_domain_lang", {
        domain_name: this.$store.getters["domain/act_domain_name"],
        language: domain_language
      })
      const has_domain_lang = this.$store.getters["domain/has_lang_domain_data"](domain, domain_language)

      if (this.is_standalone) {
        await this.persist_domains()
        await this.persist_templates()
      }

      if (has_domain_lang) {
        if (update_settings) {
          this.set_settings_value(DOMAIN_LANGUAGE, domain_language)
        }

        // UPDATE SEARCH CONFIG
        this.$store.commit("search/replace_in_act_config",
          Object.assign({
              name: "language",
              t_label: "asp.language.label",
            },
            {
              value: pack_value(this.get_language_options([domain_language]))
            }))
      }

      if (snackbar) {
        this.ok_snackbar(this.$t("comp.language_select.domain_language_changed", {language_name: this.t_lang(domain_language)}))
      }
    },
    /**
     *
     * @param domain one domain or null, which considers all domain
     * @param language the language required
     */

    async init_specifics(domains, language) {
      console.log("init_specifics", domains, language)
      if (!Array.isArray(domains)) {
        domains = [domains]
      }
      if (!this.$store.getters["domain/has_lang_domain_data"](NO_DOMAIN, language)
        && !domains.includes(NO_DOMAIN)) {
        domains.push(NO_DOMAIN)
      }
      const {data} = await this.$api.basic.domain_basics(domains, language)
      // todo this also gets all the messages
      const domains_data = data.data.domains

      this.$store.commit("domain/add_domains_data", domains_data)
      // console.log(data.data.templates_and_codes)
      await this.$store.dispatch("templates/add_templates_codes", data.data.templates_and_codes)
      // domains
      await this.persist_domains()
      // templates & codes...
      await this.persist_templates()
      return Promise.resolve()
    },
    get_language_options(codes) {
      if (!codes) {
        codes = this.$store.getters["available_languages"]
      }
      // console.log(codes)
      // console.trace()
      // todo there is a nice func for this...
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
