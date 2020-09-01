import {reload_storage} from "~/lib/client"
import {mapGetters} from "vuex"
import {APP_CONNECTED, APP_CONNECTING, APP_DB_LOADED, APP_INITIALIZED} from "~/store/app"
import {dev_env} from "~/lib/util"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import {PAGE_INDEX} from "~/lib/pages"
import {default_settings} from "~/lib/settings"
import {SET_DOMAINS, SET_TEMPLATES_CODES} from "~/store"
import {USER_GET_AUTH_TOKEN, USER_LOGIN} from "~/store/user"
import {ENTRIES_HAS_FULL_ENTRY, ENTRIES_SAVE_ENTRY} from "~/store/entries"
import {db_vars} from "~/lib/db_vars"

export default {
  name: "InitializationMixin",
  mixins: [FixDomainMixin],
  created() {
    if (!this.db_loaded)
      this.reload_storage()
    if (!this.$api.is_initialized()) {
      this.$api.init(this.$axios) // , "https://opentek.eu"
      if (!dev_env()) {
        this.privacy_sheet_open = true
      }
    }
  },
  data() {
    return {
      // privacy_sheet_open: false
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
        console.log("RELOAD STORAGE")
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

      const {data} = await this.$api.init_data()
      const domains_basic_data = data.data.domains
      this.$store.commit(SET_DOMAINS, domains_basic_data)
      this.$store.dispatch(SET_TEMPLATES_CODES, data.data.templates_and_codes)

      const auth_token = this.$store.getters[USER_GET_AUTH_TOKEN]
      if (auth_token.access_token) {
        const login = await this.$api.actor__validate_token(auth_token)
        if (login.data.token_valid) {
          this.$store.commit(USER_LOGIN)
          this.$api.axios.setToken(auth_token.access_token, "Bearer")
        } else {
          console.log("stored token is not valid anymore")
          // todo, bring this method to the mixin, so we can trigger a snackbar
          this.$store.dispatch("user/logout")
          this.$localForage.removeItem("auth_token")
          this.error_snackbar("You are logged out")
        }
      }

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
      return Promise.resolve()
    }
  },
  watch: {
    db_loaded(val) {
      // console.log("db loaded", this.initialized)
      if (val) {
        // console.log("layout. initializing")
        this.initialize().then(() => {
          this.$store.dispatch(APP_CONNECTED)
          // console.log(this.has_multiple_domains, this.get_one_domain_name)
          if (!this.has_multiple_domains) {
            this.fix_domain(this.get_one_domain_name)
            // todo, maybe this should be replaces by something in the store
            // similar the change of the home route...
            default_settings.fixed_domain = this.get_one_domain_name
            if (this.$route.name === PAGE_INDEX) {
              this.to_domain(this.$store.getters.domains[0].name, true)
              setTimeout(() => {
                this.$store.commit(APP_INITIALIZED)
              }, 80)
            } else {
              this.$store.commit(APP_INITIALIZED)
            }
          }
        })
      }
    }
  }
}
