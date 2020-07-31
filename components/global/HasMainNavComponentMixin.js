import {ENTRIES_GET_ENTRY} from "~/store/entries"
import {route_change_query} from "~/lib/util"
import {mapMutations, mapGetters} from "vuex"
import URLQueryMixin from "~/components/util/URLQueryMixin"
import {} from "vuex"

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
      menu_open: "menu/open",
      menu_state:"menu/menu_state",
      menu_width: "menu/menu_width",
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
    ...mapMutations({switch_menu_open: 'menu/switch_open', set_menu_open: "menu/open", set_menu_state:"menu/menu_state"}),
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
        // TODO bring it back
        if (easeToFirst) {
          const entry_loc = this.$store.getters[ENTRIES_GET_ENTRY](entry_uuid).location
          if (entry_loc && entry_loc.length > 0) {
            this.map_goto_location(entry_loc[0])
          }
        }
      }
      this.set_menu_open(true)
      Object.assign(query, this.query_param_domain)
      this.$router.push(route_change_query(this.$route, query, true))
    },
  }
}
