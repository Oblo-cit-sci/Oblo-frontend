import {mapGetters} from "vuex"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import {PAGE_INDEX} from "~/lib/pages"
import {default_settings} from "~/lib/settings"
import {db_vars} from "~/lib/db_vars"
import SettingsChangeMixin from "~/components/global/SettingsChangeMixin"
import {DOMAIN_LANGUAGE, NO_DOMAIN, QP_lang, UI_LANGUAGE} from "~/lib/consts"
import HomePathMixin from "~/components/menu/HomePathMixin"
import EnvMixin from "~/components/global/EnvMixin"
import URLQueryMixin from "~/components/util/URLQueryMixin";
import LanguageMixin from "~/components/LanguageMixin";

export default {
  name: "InitializationMixin",
  mixins: [FixDomainMixin, SettingsChangeMixin, HomePathMixin, EnvMixin, URLQueryMixin, LanguageMixin],
  created() {
    if (!this.db_loaded)
      this.reload_storage()
    if (!this.$api.is_initialized()) {
      this.$api.init(this.$axios)
      if (this.is_prod) {
        this.privacy_sheet_open = true
      }
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
      const auth_token = this.$store.getters["user/get_auth_token"]
      if (auth_token.access_token) {
        const login = await this.$api.actor.validate_token(auth_token)
        if (login.data.token_valid) {
          console.log("stored token is valid")
          this.$store.commit("user/login")
          this.$api.axios.setToken(auth_token.access_token, "Bearer")
        } else {
          console.log("stored token is not valid anymore")
          // todo, bring this method to the mixin, so we can trigger a snackbar
          this.$store.dispatch("user/logout")
          this.$localForage.removeItem("auth_token")
          this.error_snackbar(this.$t("mixin.init.logged_out"))
        }
      } else {
        await this.$store.dispatch("user/logout")
        this.$localForage.removeItem("auth_token")
      }
      // todo maybe the language should come not from the settings, since setting the language triggers
      // reload...
      const user_settings = this.$store.getters["user/settings"]
      const domain_name = this.query_param_domain_name || user_settings.fixed_domain
      const i_language = this.$route.query[QP_lang] || user_settings.domain_language || process.env.default_language || "en"
      console.log("init with, ",domain_name, i_language)
      const {data} = await this.$api.basic.init_data(domain_name ? [domain_name, NO_DOMAIN] : null, i_language)
      console.log("connected")

      const domains_data = data.data.domains
      const language = data.data.language
      this.$store.commit("domain/set_domains", {domains_data, language})
      await this.$store.dispatch("templates/add_templates_codes", data.data.templates_and_codes)
      // console.log("template/codes stored")
      // console.log(data.data)
      this.$store.commit("set_available_languages", data.data.languages)
      this.$store.commit("user/change_setting", {[DOMAIN_LANGUAGE]: language, [UI_LANGUAGE]: language})
      // console.log("language", language)
      // console.log("?", language, language !== this.$i18n.fallbackLocale, this.$i18n.fallbackLocale)
      if (language !== this.$i18n.fallbackLocale) {
        // console.log("change lang", language, data.data.messages)
        this.$i18n.setLocaleMessage(language, data.data.messages)
        // console.log(Object.keys(this.$i18n.getLocaleMessage(language)))
        // const a = this
        // debugger
        await this.change_language(language, false)
      }

      // todo maybe this part should be handled by the individual page, so it can do its default behaviour
      // but a wrapper would be good.
      if (this.$route.query.uuid && !this.$store.getters["entries/has_full_entry"](this.$route.query.uuid)) {
        console.log("need to get that entry")
        try {
          const response = await this.$api.entry.get_(this.$route.query.uuid)
          if (response.status === 200) {
            this.$store.commit("entries/save_entry", response.data.data)
          } else {
            this.$router.push("/")
          }
        } catch (e) {
          console.log(e)
          this.$router.push("/")
        }
      }

      this.$store.dispatch("app/connected")
      // console.log("initialize multiple domains?", this.has_multiple_domains)
      if (!this.has_multiple_domains) {
        // console.log("1 domain:", this.get_one_domain_name)
        this.$store.commit("domain/set_act_domain", this.$store.getters["domain/domain_by_name"](this.get_one_domain_name).name)
        this.fix_domain(this.get_one_domain_name)
        this.$store.commit("domain/set_act_lang_domain_data", {domain_name: this.get_one_domain_name, language})

        // todo, maybe this should be replaces by something in the store
        // similar the change of the home route...
        default_settings.fixed_domain = this.get_one_domain_name
        // console.log("route name", this.$route.name, this.$route.name === PAGE_INDEX)
        if (this.$route.name === PAGE_INDEX) {
          // console.log("to domain page",this.get_one_domain_name)
          this.to_domain(this.get_one_domain_name, true)
          setTimeout(() => {
            this.$store.commit("app/initialized")
          }, 80)
        } else {
          const domain_name = this.$store.getters["user/settings"].fixed_domain || NO_DOMAIN
          this.$store.commit("domain/set_act_domain", domain_name)
          this.$store.commit("app/initialized")
        }
      } else {
        this.$store.commit("app/initialized")
      }
      // console.log("done")
      return Promise.resolve()
    }
  },
  watch: {
    db_loaded(val) {
      // console.log("db loaded", this.initialized)
      if (val) {
        // console.log("layout. initializing")
        if (this.$nuxt.isOffline) {
          console.log("offline")
          this.$router.push("/offline")
          this.set_home_path("/offline")
          setTimeout(() => {
            this.$store.commit("app/initialized")
          }, 80)
          return
        }
        this.initialize().then(() => {

        }, err => {
          console.log("initialization failed", err)
        })
      }
    }
  }
}
