import {QP_D} from "~/lib/consts";
import {MAP_GOTO_LOCATION, MAP_LAST_GOTO_LOCATION} from "~/store/map";
import {PAGE_DOMAIN} from "~/lib/pages"

/**
 * at the moment, it requires a this-entry to exist
 */
export default {
  name: "MapJumpMixin",
  mixins: [],
  components: {},
  props: {},
  data() {
    return {}
  },
  created() {
  },
  computed: {
    // works only for entries, not aspects
    // todo maybe somewhere else...
    has_action_goto_location() {
      return this.entry.location && this.actions.includes('goto_location')
    },
    num_locations() {
      return (this.entry.location || []).length
    }
  },
  methods: {
    goto_next_location(entry_location, uuid) {
      const act_loc = this.$store.getters[MAP_LAST_GOTO_LOCATION]()
      const index = this.$_.findIndex(entry_location, (l) => l === act_loc)
      const next_index = (index + 1) % entry_location.length
      this.goto_location(entry_location[next_index], uuid)
    },
    goto_location(location, uuid = null) {
      console.log("mapjump mixin.goto_location uuid", location)
      let domain = null
      if (uuid) {
        const entry = this.$store.getters["entries/get_entry"](uuid)
        // console.log(entry.domain)
        domain = entry.domain
      } else {
        // todo this could be gloabl...
        domain = this.$store.getters["domain"].name || this.$store.getters.domains[0].name
      }
      this.$store.commit(MAP_GOTO_LOCATION, location)
      if (this.$route.name !== PAGE_DOMAIN) {
        let route = {
          path: "/domain",
          query: {
            [QP_D]: domain
          }
        }
        if (uuid) {
          route.query.uuid = uuid
        }
        this.$router.push(route)
      }
    }
  }
}
