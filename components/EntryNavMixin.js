import {fetch_entry} from "../lib/entry";
import {GLOBAL, VIEW} from "../lib/consts";
import {ENTRIES_GET_ENTRY, GET_ASPECT_DEF} from "../lib/store_consts";
import {aspect_loc_str} from "../lib/aspect";

export default {
  methods: {
    // why does has_entry call get entry
    has_entry(uuid) {
      return this.$store.getters[ENTRIES_GET_ENTRY](uuid)
    },
    fetch_and_nav(uuid) {
      fetch_entry(this.$store, this.$axios, uuid).then(entry => {
        console.log("got entry", entry)
        this.$router.push("/entry/" + uuid)
      }).catch(() => {
        // todo ENH: could also be an error msg from the server
        this.$store.commit("set_error_snackbar", "Couldn't fetch entry")
      })
    },
    to_parent(to_last_element = true, mode = VIEW) {
      if (this.in_context) {
        let parent_entry_type_slug = this.$store.getters[ENTRIES_GET_ENTRY](this.entry.refs.parent.uuid).type_slug

        // TODO this loc stuff will work different in the future
        const aspect_def = this.$store.getters[GET_ASPECT_DEF]({
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
            page: page,
            mode: mode
          }
        }

        if (to_last_element) {
          const aspect_id = aspect_loc_str(this.entry.refs.parent.aspect_loc)
          route.query.goTo = (aspect_id ? aspect_id : "")
        }
        this.$router.push(route)
      } else {
        console.log("leaving...")
        this.$router.push("/")
      }
    },
    to_entry(uuid, mode = 'view') {
      let route = {
        name: "entry-uuid",
        params: {
          uuid: uuid
        },
        query: {
          mode: mode
        }
      }
      this.$router.push(route)
    }
  },
  computed: {
    in_context() {
      return this.entry_type.content.meta.context !== GLOBAL
    }
  }
}
