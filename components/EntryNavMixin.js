import {aspect_loc_str, fetch_entry} from "../lib/entry";
import {GLOBAL} from "../lib/consts";

export default {
  methods: {
    has_entry(uuid) {
      return this.$store.getters["entries/get_entry"](uuid)
    },
    fetch_and_nav(uuid) {
      fetch_entry(this.$store, this.$axios, uuid).then(entry => {
        this.$router.push("/entry/" + uuid)
      }).catch(res => {
        console.log(res)
        // todo ENH: could also be an error msg from the server
        this.$store.commit("set_error_snackbar", "Couldn't fetch entry")
      })
    },
    to_parent() {
      if (this.in_context) {
        const aspect_id = aspect_loc_str(this.entry.refs.parent.aspect_loc)
        this.$router.push("/entry/" + this.entry.refs.parent.uuid + (aspect_id ? "?goTo=" + aspect_id : ""))
      } else {
        this.$router.push("/")
      }
    }
  },
  computed: {
    in_context() {
      return this.entry_type.content.meta.context !== GLOBAL
    },
  }
}
