import {string_list2options} from "~/lib/options";
import {LOCATION} from "~/lib/consts";

import NavBaseMixin from "~/components/NavBaseMixin"

// the navigation either shows the search or one specific entry

export const SEARCH = "search"
export const ENTRY = "entry"

export default {
  name: "MapNavigationMixin",
  mixins: [NavBaseMixin],
  props: {
    // drawer: Boolean,
    // layers: Array,
    // navigation_mode: String, // synced
    // selected_entry_uuid: String // synced
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
    preview_options() {
      // not used anymore...
      return {
        actions: [{
          name: "goto_loc",
          type: "goto_loc",
          title: "",
          icon: "mdi-map-marker"
        }],
        prevent_view_page_change: true
      }
      // return {}
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
      this.$store.commit("map/set_entries", entries)
    },
    to_search_mode() {
      this.$emit("navigation_mode_search")
    },
    preview_action({uuid, action}) {
     this.$emit("navigation_mode_entry", {uuid, mode: action})
    }
  },
}
