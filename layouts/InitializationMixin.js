import {initialize, reload_storage} from "~/lib/client"
import {mapGetters} from "vuex"
import {APP_CONNECTED, APP_CONNECTING, APP_DB_LOADED, APP_INITIALIZED} from "~/store/app"
import {dev_env} from "~/lib/util"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import {PAGE_INDEX} from "~/lib/pages"

export default {
  name: "InitializationMixin",
  mixins: [FixDomainMixin],
  created() {
    if (!this.db_loaded)
      reload_storage(this.$store, this.$localForage)
    if (!this.$api.is_initialized()) {
      this.$api.init(this.$axios) // , "https://opentek.eu"
      if (!dev_env()) {
        this.privacy_sheet_open = true
      }
    }
  },
  data() {
    return {
      privacy_sheet_open: false
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
  watch: {
    db_loaded(val) {
      // console.log("db loaded", this.initialized)
      if (val) {
        // console.log("layout. initializing")
        initialize(this.$api, this.$store, this.$route, this.$router, this.$localForage).then(() => {
          this.$store.dispatch(APP_CONNECTED)
          if (!this.has_multiple_domains && this.$route.name === PAGE_INDEX) {
            this.to_domain(this.$store.getters.domains[0].name, true)
            setTimeout(()=> {
              this.$store.commit(APP_INITIALIZED)
            },80)
          } else {
            this.$store.commit(APP_INITIALIZED)
          }
        })
      }
    }
  }
}
