import {aspect_loc_str, fetch_entry} from "../lib/entry";
import {GLOBAL} from "../lib/consts";

export default {
  methods: {
    has_entry(uuid) {
      return this.$store.getters["entries/get_entry"](uuid)
    },
    fetch_and_nav(uuid) {
      console.log("fetching")
      fetch_entry(this.$store, this.$axios, uuid).then(entry => {
        console.log("got entry", entry)
        this.$router.push("/entry/" + uuid)
      }).catch(res => {
        // todo ENH: could also be an error msg from the server
        this.$store.commit("set_error_snackbar", "Couldn't fetch entry")
      })
    },
    to_parent(to_last_element = true) {
      if (this.in_context) {


        let parent_entry_type_slug = this.$store.getters["entries/get_entry"](this.entry.refs.parent.uuid).type_slug

        // TODO this loc stuff will work different in the future
        const aspect_def = this.$store.getters["get_aspect_def"]({
          type_slug: parent_entry_type_slug,
          aspect_name: this.entry.refs.parent.aspect_loc[0][1]
        })
        const page = aspect_def.attr.page

        let route = {
          name: "entry-uuid",
          params: {
            uuid: this.entry.refs.parent.uuid
          },
          query: {
            page: page
          }
        }

        if (to_last_element) {
          const aspect_id = aspect_loc_str(this.entry.refs.parent.aspect_loc)
          route.query.goTo = (aspect_id ? aspect_id : "")
        }

        this.$router.push(route)
        //console.log(this.entry.refs.parent.aspect_loc)
        //this.$router.push("/entry/" + this.entry.refs.parent.uuid + (aspect_id ? "?goTo=" + aspect_id : ""))
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
