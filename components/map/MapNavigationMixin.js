import {string_list2options} from "../../lib/options";
import {LOCATION, MODE_ASPECT_POINT, MODE_NORMAL} from "../../lib/consts";
import {MAP_SET_ENTRIES} from "../../lib/store_consts";
import {get_location} from "~/lib/location";
import EntryAspectView from "~/components/EntryAspectView";
import Search from "~/components/Search";
import {SEARCH_GET_ENTRIES} from "~/store/search";
import {ENTRIES_GET_ENTRY} from "~/store/entries";

// the navigation either shows the search or one specific entry

export const SEARCH = "search"
export const ENTRY = "entry"

export default {
  name: "MapNavigationMixin",
  components: {EntryAspectView, Search},
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
    const search_entries = this.$store.getters[SEARCH_GET_ENTRIES]()
    if(search_entries.length > 0) {
      console.log("setting map entries", search_entries[0])
      this.$store.commit(MAP_SET_ENTRIES, search_entries)
    }
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
      this.$emit("update:selected_entry_uuid", uuid)
    },
    get_goto_device_location() {
      get_location((location) => {
        console.log(location)
      })
    }
  },
}
