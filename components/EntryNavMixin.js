import {fetch_entry} from "../lib/entry";
import {GLOBAL, NO_DOMAIN, VIEW} from "../lib/consts";
import {DOMAIN, ENTRIES_GET_ENTRY, ENTRYTYPES_GET_ASPECT_DEF, POP_LAST_PAGE_PATH} from "../lib/store_consts";
import {aspect_loc_str} from "../lib/aspect";
import TriggerSnackbarMixin from "./TriggerSnackbarMixin";
import NavBaseMixin from "./NavBaseMixin";

export default {
  mixins: [TriggerSnackbarMixin, NavBaseMixin],
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
        this.error_snackbar("Couldn't fetch entry")
      })
    },
    to_parent(to_last_element = true, mode = VIEW) {
      if (this.in_context) {
        const parent_ref = this.entry.refs.parent
        let parent_entry_type_slug = this.$store.getters[ENTRIES_GET_ENTRY](parent_ref.uuid).type_slug

        const uuid = parent_ref.uuid

        // TODO this loc stuff will work different in the future
        const aspect_def = this.$store.getters[ENTRYTYPES_GET_ASPECT_DEF]({
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
        this.$store.commit(POP_LAST_PAGE_PATH)
        this.to_entry(uuid, mode, query)
      } else {
        if(this.domain.value === NO_DOMAIN) {
          this.$router.push("/")
        } else {
          // todo could be a bit nicer (named router, route param...)
          this.$router.push("/domain/"+ this.domain.value)
        }
      }
    }
  },
  computed: {
    in_context() {
      return this.entry_type.rules.context !== GLOBAL || this.entry.refs.parent
    },
    domain() {
      return this.$store.getters[DOMAIN]
    }
  }
}
