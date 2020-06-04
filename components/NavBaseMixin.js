import {VIEW} from "~/lib/consts";
import {INIT_PAGE_PATH} from "~/store"

export default {
  name: "NavBaseMixin",
  methods: {
    home() {
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
