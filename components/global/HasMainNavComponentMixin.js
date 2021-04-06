import {route_change_query} from "~/lib/util"
import {mapMutations, mapGetters} from "vuex"
import URLQueryMixin from "~/components/util/URLQueryMixin"
import {VIEW} from "~/lib/consts"
import EntryFetchMixin from "~/components/entry/EntryFetchMixin";

export const SEARCH = "search"
export const ENTRY = "entry"

export default {
  name: "HasMainNavComponentMixin",
  mixins: [URLQueryMixin, EntryFetchMixin],
  computed: {
    // navgiagtion_component() {
    //   if (this.$vuetify.breakpoint.mdAndDown)
    //     return MapNavigationBottomSheet
    //   else
    //     return MapNavigationDrawer
    // },
    ...mapGetters({
      menu_open: "menu/open",
      menu_state: "menu/menu_state",
      menu_width: "menu/menu_width",
    }),
    navigation_mode() {
      // todo should be menu-state? and MENU_MODE_MAIN, MENU_MODE_DOMAIN?
      if (this.query_entry_uuid) {
        return ENTRY
      } else
        return SEARCH
    },
    entry_mode() {
      return this.$route.query.entry_mode || VIEW
    }
  },
  methods: {
    ...mapMutations({
      switch_menu_open: 'menu/switch_open',
      set_menu_open: "menu/open",
      set_menu_state: "menu/menu_state"
    }),
    navigate_entry({uuid, mode}) {
      this.update_navigation_mode(uuid, mode)
    },
    unselect_entry() {
      this.update_navigation_mode(null)
    },
    async update_navigation_mode(entry_uuid, entry_mode, easeToFirst = true, open_menu = true) {
      // console.log("HasMain...-update_navigation_mode", entry_uuid)

      // console.log("update_navigation_mode", easeToFirst)
      const query = {}
      if (entry_uuid) {
        await this.guarantee_entry(entry_uuid, this.query_entry_access_key)
        query.uuid = entry_uuid
      }
      if (entry_mode) {
        query.entry_mode = entry_mode
        // TODO bring it back
        if (easeToFirst) {
          const entry_loc = this.$store.getters["entries/get_entry"](entry_uuid).location
          if (entry_loc && entry_loc.length > 0) {
            this.map_goto_location(entry_loc[0])
          }
        }
      }
      if (open_menu) {
        this.set_menu_open(true)
      }
      Object.assign(query, this.query_param_domain)
      this.$router.push(route_change_query(this.$route, query, true))
    },
    update_menu_state(state) {
      this.$store.commit("menu/menu_state", state)
    }
  }
}
