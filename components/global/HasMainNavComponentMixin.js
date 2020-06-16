import MapNavigationBottomSheet from "~/components/map/MapNavigationBottomSheet"
import MapNavigationDrawer from "~/components/map/MapNavigationDrawer"
import {ENTRIES_GET_ENTRY} from "~/store/entries"
import {route_change_query} from "~/lib/util"
import {mapMutations} from "vuex"

export const SEARCH = "search"
export const ENTRY = "entry"

export default {
  name: "HasMainNavComponentMixin",
  data() {
    return {
      drawer: false
    }
  },
  computed: {
    // navgiagtion_component() {
    //   if (this.$vuetify.breakpoint.mdAndDown)
    //     return MapNavigationBottomSheet
    //   else
    //     return MapNavigationDrawer
    // },
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
      console.log("nav")
    },
    ...mapMutations({switch_nav_drawer: 'app/switch_nav_drawer'}),
    navigate_entry({uuid, mode}) {
      this.update_navigation_mode(uuid, mode)
    },
    unselect_entry() {
      this.update_navigation_mode(null)
    },
    update_navigation_mode(entry_uuid, entry_mode, easeToFirst = true) {
      if (this.selected_entry) {
        // todo move to map logic
        // this.change_entry_markers_mode(this.selected_entry, false)
      }
      const query = {}
      if (entry_uuid) {
        query.uuid = entry_uuid
      }
      if (entry_mode) {
        query.entry_mode = entry_mode
        this.drawer = true
        // todo MAP
        // this.change_entry_markers_mode(entry_uuid, true)
        if (easeToFirst) {
          const entry_loc = this.$store.getters[ENTRIES_GET_ENTRY](entry_uuid).location
          if (entry_loc && entry_loc.length > 0) {
            this.map_goto_location(entry_loc[0])
          }
        }
      }
      this.$router.push(route_change_query(this.$route, query, true))
    },
  }
}
