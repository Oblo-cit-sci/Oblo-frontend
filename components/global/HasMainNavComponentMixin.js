import {ENTRIES_GET_ENTRY} from "~/store/entries"
import {route_change_query} from "~/lib/util"
import {mapMutations} from "vuex"
import URLQueryMixin from "~/components/util/URLQueryMixin"
import {mapGetters} from "vuex"

export const SEARCH = "search"
export const ENTRY = "entry"

export default {
  name: "HasMainNavComponentMixin",
  mixins: [URLQueryMixin],
  computed: {
    // navgiagtion_component() {
    //   if (this.$vuetify.breakpoint.mdAndDown)
    //     return MapNavigationBottomSheet
    //   else
    //     return MapNavigationDrawer
    // },
    ...mapGetters({
      nav_drawer: "app/nav_drawer"
    }),
    navigation_mode() {
      if (this.$route.query.uuid) {
        return ENTRY
      } else
        return SEARCH
    },
    selected_entry() {
      return this.$route.query.uuid
    }
  },
  methods: {
    nav() {
      // console.log("nav")
    },
    ...mapMutations({switch_nav_drawer: 'app/switch_nav_drawer', set_nav_drawer: "app/nav_drawer"}),
    navigate_entry({uuid, mode}) {
      this.update_navigation_mode(uuid, mode)
    },
    unselect_entry() {
      this.update_navigation_mode(null)
    },
    update_navigation_mode(entry_uuid, entry_mode, easeToFirst = true) {
      // console.log("update_navigation_mode", easeToFirst)
      const query = {}
      if (entry_uuid) {
        query.uuid = entry_uuid
      }
      if (entry_mode) {
        query.entry_mode = entry_mode
        this.set_nav_drawer(true)
        // TODO bring it back
        if (easeToFirst) {
          const entry_loc = this.$store.getters[ENTRIES_GET_ENTRY](entry_uuid).location
          if (entry_loc && entry_loc.length > 0) {
            this.map_goto_location(entry_loc[0])
          }
        }
      }
      Object.assign(query, this.query_param_domain)
      this.$router.push(route_change_query(this.$route, query, true))
    },
  }
}
