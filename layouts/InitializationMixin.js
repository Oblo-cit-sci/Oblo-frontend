import {mapGetters} from "vuex"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import {PAGE_DOMAIN, PAGE_INDEX} from "~/lib/pages"
import {default_settings} from "~/lib/settings"
import {db_vars} from "~/lib/db_vars"
import SettingsChangeMixin from "~/components/global/SettingsChangeMixin"
import {DOMAIN_LANGUAGE, NO_DOMAIN, QP_lang, UI_LANGUAGE, VISITOR} from "~/lib/consts"
import HomePathMixin from "~/components/menu/HomePathMixin"
import EnvMixin from "~/components/global/EnvMixin"
import URLQueryMixin from "~/components/util/URLQueryMixin";
import LanguageMixin from "~/components/LanguageMixin";
import EntryFetchMixin from "~/components/entry/EntryFetchMixin";
import OfflineMixin from "~/lib/OfflineMixin"
import {is_standalone} from "~/lib/pwa"

export default {
  name: "InitializationMixin",
  mixins: [FixDomainMixin, SettingsChangeMixin, HomePathMixin, EnvMixin, URLQueryMixin, LanguageMixin, EntryFetchMixin, OfflineMixin],
  created() {
    // console.log("db loaded??", this.db_loaded)
    default_settings.ui_language = this.default_language
    default_settings.domain_language = this.default_language
    if (!this.db_loaded)
      this.reload_storage()
    if (!this.$api.is_initialized()) {
      this.$api.init(this.$axios)
      if (this.is_prod) {
        this.privacy_sheet_open = true
      }
      // console.log(this.$api.axios.)
    }
  },
  computed: {
    ...mapGetters({
      db_loaded: "app/db_loaded",
      connected: "app/connected",
      initialized: "app/initialized"
    }),
  },
  methods: {
    reload_storage() {
      if (this.$localForage) {
        const remaining = db_vars.map(v => v.name)
        for (let store_var_descr of db_vars) {
          // console.log("loading", store_var_descr.name)
          this.$localForage.getItem(store_var_descr.name).then(store_var => {
            // console.log("db items: ", store_var_descr.name, store_var)
            if (store_var) {
              // console.log(store_var.constructor)
              this.$store.commit(store_var_descr.store_mutation, store_var)
            }
            remaining.splice(remaining.indexOf(store_var_descr.name), 1);
            if (remaining.length === 0) {
              this.$store.commit("app/db_loaded")
            }
          }).catch(err => {
            console.log("localForage error", err)
          })
        }
      }
    },
    async initialize() {
      console.log("initialize")
      // todo maybe this should be before init_data, to request the set language
      /*
        Authentication
       */
      try {
        const {data: resp} = await this.$api.actor.validate_session()
        if (resp.session_valid) {
          this.$store.dispatch("user/login", resp.data)
        }
        // this.process_login(me.data)
      } catch (e) {
        console.log("not logged in")
      }
      /*
       * get the language from the settings and
       */
      // todo maybe the language should come not from the settings, since setting the language triggers
      // reload...
      const user_settings = this.$store.getters["user/settings"]
      const domain_name = this.query_param_domain_name || user_settings.fixed_domain || NO_DOMAIN

      const qp_lang = this.$route.query[QP_lang]
      if (qp_lang !== undefined) {
        if (qp_lang !== user_settings.ui_language || qp_lang !== user_settings.domain_language) {
          await this.change_language(qp_lang)
        }
      }
      const i_language = qp_lang || user_settings.ui_language || this.default_language

      console.log(`init with domain: ${domain_name}, lang: ${i_language}`)

      const {data: resp} = await this.$api.basic.init_data(domain_name ? [domain_name, NO_DOMAIN] : null, i_language)

      // todo here call complete_language_domains if on domain-page and domain-lang different than ui-lang
      // console.log(resp)
      console.log("connected")

      const platform_data = resp.data.platform
      this.$store.commit("app/platform_data", platform_data)

      this.$store.commit("app/oauth_services", resp.data.oauth_services)

      const domains_data = resp.data.domains

      const language = resp.data.language

      const domains_overview = resp.data.domains_overview
      await this.$store.dispatch("domain/set_domains", {domains_data, language})
      await this.$store.dispatch("domain/add_overviews", domains_overview)
      await this.$store.dispatch("templates/add_templates_codes", resp.data.templates_and_codes)

      if (this.$route.name === PAGE_DOMAIN && user_settings.domain_language !== user_settings.ui_language) {
        await this.complete_language_domains(domain_name, user_settings.domain_language)
      }

      // console.log("template/codes stored")
      // console.log(data.data)
      this.$store.commit("set_available_languages", resp.data.languages)

      if (this.$store.getters.username === VISITOR) {
        const settings = this.$_.cloneDeep(default_settings)
        Object.assign(settings, {[DOMAIN_LANGUAGE]: language, [UI_LANGUAGE]: language})
        // todo change_language call
        this.$store.commit("user/change_setting", settings)
      }
      // console.log("language", language)
      // console.log("?", language, language !== this.$i18n.fallbackLocale, this.$i18n.fallbackLocale)
      if (language !== this.$i18n.fallbackLocale) {
        this.$i18n.setLocaleMessage(language, resp.data.messages[language])
        await this.change_language(language, false)
      } else {
        await this.guarantee_default_lang_language_names()
      }

      // todo maybe this part should be handled by the individual page, so it can do its default behaviour
      // but a wrapper would be good.

      await this.$store.dispatch("app/connected")

      console.log("multi domains?", this.has_multiple_domains)
      if (!this.has_multiple_domains) {
        await this.complete_language_domains(this.get_one_domain_name, language)
        // console.log("1 domain:", this.get_one_domain_name)
        this.$store.commit("domain/set_act_domain", this.$store.getters["domain/domain_by_name"](this.get_one_domain_name).name)
        this.fix_domain(this.get_one_domain_name)
        this.$store.commit("domain/set_act_lang_domain_data", {domain_name: this.get_one_domain_name, language})

        // todo, maybe this should be replaces by something in the store
        // similar the change of the home route...
        default_settings.fixed_domain = this.get_one_domain_name
        // console.log("route name", this.$route.name, this.$route.name === PAGE_INDEX)
        this.set_home_path(`/domain?f=${domain_name}`)
        if (this.$route.name === PAGE_INDEX) {
          // console.log("to domain page",this.get_one_domain_name)
          this.to_domain(this.get_one_domain_name, true, () => {
            this.set_init_done()
          })
        } else {
          // todo not sure why this is here- just one domain anyway
          const domain_name = this.$store.getters["user/settings"].fixed_domain || NO_DOMAIN
          this.$store.commit("domain/set_act_domain", domain_name)
          this.set_init_done()
        }
      } else {
        const fixed_domain = this.$store.getters["user/settings"].fixed_domain || NO_DOMAIN
        // if (fixed_domain) {
        //   domain_name = fixed_domain
        // }
        // console.log(`user fixed-domain: ${fixed_domain}`)
        await this.$store.dispatch("domain/set_act_domain_lang", {
          domain_name: domain_name,
          language
        })
        if (this.$route.name === PAGE_INDEX) {
          // console.log("to domain page",this.get_one_domain_name)
          if (fixed_domain !== NO_DOMAIN) {
            this.to_domain(fixed_domain, true, () => {
              this.set_init_done()
            })
          } else {
            this.set_init_done()
          }
        } else {
          this.set_init_done()
        }
      }
      // console.log("done")
      return Promise.resolve()
    },
    set_init_done() {
      console.log("set init done")
      this.$store.commit("app/initialized")
    },
    async load_offline_data() {
      const domain_data = await this.$localForage.getItem("domains")
      this.$store.commit("domain/set_from_storage", domain_data)
      const tempates_data = await this.$localForage.getItem("templates")
      this.$store.commit("templates/set_from_storage", tempates_data)

      const messages = await this.$localForage.getItem("messages")
      for (let lang in messages) {
        this.$i18n.setLocaleMessage(lang, messages[lang])
      }
      this.$store.commit("set_available_languages", Array.from(Object.keys(messages)))
      const user_data = await this.$localforage.getItem("user_data")
      this.$store.commit("user/set_user_data", user_data)
      const user_settings = await this.$localforage.getItem("user_settings")
      this.$store.commit("user/set_settings", user_settings)

      const offline_misc_data = await this.$localForage.getItem("offline_misc_data")
      await this.$store.dispatch("set_offline_misc_data", offline_misc_data)
    }
  },
  watch: {
    async db_loaded(loaded) {
      console.log("db loaded", loaded)
      if (loaded) {
        if (this.is_offline) {
          console.log("offline")
          await this.load_offline_data()
          setTimeout(() => {
            this.$store.commit("app/initialized")
            this.$store.commit("app/set_menu_to", {name: "index", to: "/offline"})
            // this.$bus.$emit("main-menu-set", {name: "index", to: "/offline"})
          }, 80)
          this.$router.push("/offline")
        } else {
          this.initialize().then(() => {
            console.log("all done")
            if (is_standalone()) {
              console.log("gonna store all relevant data for offline mode")
              this.persist_for_offline_mode()
            }
            // const token = this.$store.getters["user/get_auth_token"]
            // const evtSource = new EventSource(this.$api.api_baseURL + `/sse/stream?token=${token.access_token}`);
            // evtSource.onmessage = function (event) {
            //   console.log(event.data)
            // }
          }, err => {
            console.log("initialization failed", err)
          })
        }
        // console.log("layout. initializing")
        // if (this.$nuxt.isOffline) {
        //   console.log("offline")
        //   this.$router.push("/offline")
        //   this.set_home_path("/offline")
        //   setTimeout(() => {
        //     this.$store.commit("app/initialized")
        //   }, 80)
        //   return
        // }

      }
    }
  }
}
