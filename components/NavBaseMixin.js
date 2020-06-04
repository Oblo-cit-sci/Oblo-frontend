import {VIEW} from "~/lib/consts";
import {DOMAIN, INIT_PAGE_PATH} from "~/store"
import {APP_FIXED_DOMAIN} from "~/store/app"

export default {
  name: "NavBaseMixin",
  methods: {
    home() {
      // actually the redirect takes care of this...
      if(this.$store.getters[APP_FIXED_DOMAIN]) {
        return this.$router.push("/domain", {
          f: this.$store.getters[DOMAIN].name
        })
      }
      this.$router.push("/")
    },
    to_entry(uuid, mode = VIEW, query = {}, log_page = true) {
      // console.log("to entry")
      let route = {
        name: "entry",
        query: {
          uuid,
          entry_mode: mode,
          ...query
        }
      }
      if (log_page) {
        this.$store.commit(INIT_PAGE_PATH, this.$route)
      }
      this.$router.push(route)
    }
  }
}
