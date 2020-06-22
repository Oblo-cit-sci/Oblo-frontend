import {initialize, reload_storage} from "~/lib/client"
import {mapGetters} from "vuex"
import {APP_DB_LOADED} from "~/store/app"
import {dev_env} from "~/lib/util"

export default {
  name: "InitializationMixin",
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
    ...mapGetters({
      db_loaded: APP_DB_LOADED
    })
  },
  watch: {
    db_loaded(val) {
      // console.log("db loaded", this.initialized)
      if (val) {
        // console.log("layout. initializing")
        initialize(this.$api, this.$store, this.$route, this.$router, this.$localForage)
      }
    }
  }
}
