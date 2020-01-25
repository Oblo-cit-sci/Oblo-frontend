import {string_list2options} from "../../lib/options";
import {LOCATION, MODE_ASPECT_POINT, MODE_NORMAL} from "../../lib/consts";
import {ENTRIES_GET_ENTRY, MAP_SET_ENTRIES} from "../../lib/store_consts";

// the navigation either shows the search or one specific entry

export const SEARCH = "search"
export const ENTRY = "entry"

export default {
  name: "MapNavigationMixin",
  props: {
    drawer: Boolean,
    layers: Array,
    map_mode: String,
    navigation_mode: String, // synced
    selected_enry_uuid: String // synced
  },
  data() {
    return {
      location_pre_filter: [
        {
          name: "meta_aspect",
          meta_aspect_name: LOCATION
        }
      ]
    }
  },
  computed: {
    select_map_mode() {
      return this.map_mode === MODE_ASPECT_POINT
    },
    normal_map_mode() {
      return this.map_mode === MODE_NORMAL
    },
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
      return this.$store.getters[ENTRIES_GET_ENTRY](this.selected_enry_uuid)
    },
    preview_options() {
      return {
        actions: ['goto_location'],
        prevent_page_change: true
      }
    }
  },
  methods: {
    back() {
      this.$router.back()
    },
    layer_select_change(active_layers) {
      this.$emit("layerstatus", active_layers)
    },
    update_map_entries(entries) {
      console.log("map nav, num results", entries.length)
      if (entries.length > 0) {
        console.log(entries[0])
      }
      this.$store.commit(MAP_SET_ENTRIES, entries)
    },
    to_search_mode() {
      this.$emit("update:navigation_mode", SEARCH)
    },
    preview_action({uuid, action}) {
      this.$emit("update:navigation_mode", ENTRY)
      this.$emit("update:selected_enry_uuid", uuid)
    }
  },
}
