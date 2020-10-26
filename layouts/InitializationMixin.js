import {mapGetters} from "vuex"
import {APP_CONNECTED, APP_CONNECTING, APP_DB_LOADED, APP_INITIALIZED} from "~/store/app"
import {dev_env} from "~/lib/util"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import {PAGE_INDEX} from "~/lib/pages"
import {default_settings} from "~/lib/settings"
import {SET_TEMPLATES_CODES} from "~/store"
import {USER_GET_AUTH_TOKEN, USER_LOGIN} from "~/store/user"
import {ENTRIES_HAS_FULL_ENTRY, ENTRIES_SAVE_ENTRY} from "~/store/entries"
import {db_vars} from "~/lib/db_vars"
import SettingsChangeMixin from "~/components/global/SettingsChangeMixin"
import {NO_DOMAIN} from "~/lib/consts"
import HomePathMixin from "~/components/menu/HomePathMixin"

export default {
  name: "InitializationMixin",
  mixins: [FixDomainMixin, SettingsChangeMixin, HomePathMixin],
  created() {
    if (!this.db_loaded)
      this.reload_storage()
    if (!this.$api.is_initialized()) {
      this.$api.init(this.$axios)
      if (!dev_env()) {
        this.privacy_sheet_open = true
      }
    }
  },
  computed: {
    ...mapGetters([APP_CONNECTING]),
    ...mapGetters({
      db_loaded: APP_DB_LOADED,
      connected: APP_CONNECTED,
      initialized: APP_INITIALIZED
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
              this.$store.commit(APP_DB_LOADED)
            }
          }).catch(err => {
            console.log("localForage error", err)
          })
        }
      }
    },
    async initialize() {
      this.$store.commit(APP_CONNECTING, true)
      console.log("initialize")

      // todo maybe this should be before init_data, to request the set language
      const auth_token = this.$store.getters[USER_GET_AUTH_TOKEN]
      if (auth_token.access_token) {
        const login = await this.$api.actor.validate_token(auth_token)
        if (login.data.token_valid) {
          console.log("stored token is valid")
          this.$store.commit(USER_LOGIN)
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
      const {data} = await this.$api.init_data()
      const domains_data = data.data.domains
      const language = data.data.language
      this.$store.commit("set_domains", {domains_data, language})
      await this.$store.dispatch(SET_TEMPLATES_CODES, data.data.templates_and_codes)

      // console.log(data.data)
      this.$store.commit("set_available_languages", data.data.languages)

      // todo maybe this part should be handled by the individual page, so it can do its default behaviour
      // but a wrapper would be good.
      if (this.$route.query.uuid && !this.$store.getters[ENTRIES_HAS_FULL_ENTRY](this.$route.query.uuid)) {
        console.log("need to get that entry")
        try {
          const response = await this.$api.entry__$uuid(this.$route.query.uuid)
          if (response.status === 200) {
            this.$store.commit(ENTRIES_SAVE_ENTRY, response.data.data)
          } else {
            this.$router.push("/")
          }
        } catch (e) {
          console.log(e)
          this.$router.push("/")
        }
      }
      // console.log("done")
      return Promise.resolve()
    },
    async init_specifics(domain, language) {
      const {data} = await this.$api.init_data(domain, language)
      const domains_data = data.data.domains
      this.$store.commit("set_domains", {domains_data, language})
      return Promise.resolve()
    },
    /**
     *
     * @param domain one domain or null, which considers all domain
     * @param language the language required
     */
    async complete_language_domains(domain, language) {
      // console.log("completing", domain, language)
      if (domain) {
        const domain_basics = this.$store.getters["domain_by_name"](domain)
        if (domain_basics.hasOwnProperty(language)) {
          // console.log("got it already")
          return Promise.resolve()
        }
      } else {
        // check all domains
        const all_domains = this.$store.getters["domains"]
        // if no domain has the language return (is none = !some, misses the language prop = ! hasOwnProp)
        if (!this.$_.some(all_domains, d => !d.hasOwnProperty(language))) {
          // console.log("all languages have it")
          return Promise.resolve()
        }
      }

      return this.init_specifics(domain, language)
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
            this.$store.commit(APP_INITIALIZED)
          }, 80)
          return
        }
        this.initialize().then(() => {
          console.log("connected")
          const set_domain = this.$store.getters["user/settings"].fixed_domain || NO_DOMAIN
          this.$store.commit("set_domain", this.$store.getters["domain_by_name"](set_domain))
          this.$store.dispatch(APP_CONNECTED)
          //console.log("initialize multiple domains?", this.has_multiple_domains)
          if (!this.has_multiple_domains) {
            this.fix_domain(this.get_one_domain_name)
            // todo, maybe this should be replaces by something in the store
            // similar the change of the home route...
            default_settings.fixed_domain = this.get_one_domain_name
            if (this.$route.name === PAGE_INDEX) {
              this.to_domain(this.get_one_domain_name.name, true)
              setTimeout(() => {
                this.$store.commit(APP_INITIALIZED)
              }, 80)
            } else {
              this.$store.commit(APP_INITIALIZED)
            }
          } else {
            this.$store.commit(APP_INITIALIZED)
          }
        }, err => {
          console.log("initialization failed")
        })
      }
    }
  }
}
