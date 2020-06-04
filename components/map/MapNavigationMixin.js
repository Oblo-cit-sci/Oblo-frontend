import {string_list2options} from "~/lib/options";
import {LOCATION} from "~/lib/consts";
import Search from "~/components/global/Search";
import {SEARCH_GET_ENTRIES} from "~/store/search";
import {ENTRIES_GET_ENTRY} from "~/store/entries";
import {MAP_SET_ENTRIES} from "~/store/map";

// the navigation either shows the search or one specific entry

export const SEARCH = "search"
export const ENTRY = "entry"

export default {
  name: "MapNavigationMixin",
  components: {Search},
  props: {
    drawer: Boolean,
    layers: Array,
    navigation_mode: String, // synced
    selected_entry_uuid: String // synced
  },
  data() {
    return {
      location_pre_filter: [
        {
          name: "meta",
          column: LOCATION
        }
      ]
    }
  },
  created() {
  },
  computed: {
    layer_options() {
      return string_list2options(this.layers)
    },
    nav_mode_search() {
      return this.navigation_mode === SEARCH
    },
    nav_mode_entry() {
      return this.navigation_mode === ENTRY
    },
    selected_entry() {
      return this.$store.getters[ENTRIES_GET_ENTRY](this.selected_entry_uuid)
    },
    preview_options() {
      return {
        actions: [{
          name: "goto_loc",
          type: "goto_loc",
          title: "",
          icon: "mdi-map-marker"
        }],
        prevent_page_change: true
      }
      // return {}
    },
    entry_navigation_props() {
      return {
        show_back_button: false
      }
    }
  },
  methods: {
    back() {
      this.$router.back()
    },
    update_map_entries(entries) {
      console.log("map nav, num results", entries.length)
      if (entries.length > 0) {
        console.log(entries[0])
      }
      this.$store.commit(MAP_SET_ENTRIES, entries)
    },
    to_search_mode() {
      this.$emit("navigation_mode_search")
    },
    preview_action({uuid, action}) {
     this.$emit("navigation_mode_entry", {uuid, mode: action})
    }
  },
}
