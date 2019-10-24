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
    fetch_and_nav(uuid, mode = VIEW) {
      fetch_entry(this.$store, this.$axios, uuid).then(entry => {
        console.log("downloading entry", entry)
        this.to_entry(uuid, mode)
      }).catch(() => {
        // todo ENH: could also be an error msg from the server
        this.$store.commit("set_error_snackbar", "Couldn't fetch entry")
      })
    },
    to_parent(to_last_element = true, mode = VIEW) {
      if (this.in_context) {
        const parent_ref = this.entry.refs.parent
        let parent_entry_type_slug = this.$store.getters[ENTRIES_GET_ENTRY](parent_ref.uuid).type_slug

        const uuid = parent_ref.uuid

        // TODO this loc stuff will work different in the future
        const aspect_def = this.$store.getters[GET_ASPECT_DEF]({
          type_slug: parent_entry_type_slug,
          aspect_name: parent_ref.aspect_loc[0][1]
        })
        let query = {
          page:  aspect_def.attr.page,
        }
        if (to_last_element) {
          const aspect_id = aspect_loc_str(parent_ref.aspect_loc)
          query.goTo = (aspect_id ? aspect_id : "")
        }
        this.to_entry(uuid, mode, query)
      } else {
        this.$router.push("/")
      }
    },
    to_entry(uuid, mode = VIEW, query = {}) {
      let route = {
        name: "entry-uuid",
        params: {
          uuid: uuid
        },
        query: {
          mode: mode,
          ...query
        }
      }
      this.$router.push(route)
    }
  },
  computed: {
    in_context() {
      return this.entry_type.content.meta.context !== GLOBAL || this.entry.refs.parent
    }
  }
}
