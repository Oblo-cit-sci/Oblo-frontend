import {MODE_NORMAL} from "~/lib/consts";
import {MAP_GOTO_LOCATION, MAP_LAST_GOTO_LOCATION} from "~/store/map";

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
    has_action_goto_location() {
      return this.entry.location && this.actions.includes('goto_location')
    },
    num_locations() {
      return (this.entry.location || []).length
    }
  },
  methods: {
    goto_next_location(entry_location) {
      const act_loc = this.$store.getters[MAP_LAST_GOTO_LOCATION]()
      const index = this.$_.findIndex(entry_location, (l) => l === act_loc)
      const next_index = (index + 1) % entry_location.length
      this.goto_location(entry_location[next_index])
    },
    goto_location(location, select_uuid) {
      console.log("mapjump mixin.goto_location uuid",select_uuid)
      /**
       * needs uuid if this.entry does not exist (in aspects)
       */
      console.log("route", this.$route.name , this.$route.name !== "Map", this.entry)
      this.$store.commit(MAP_GOTO_LOCATION, location)
      let route = {
        path: "/Map",
        query: {
          mode: MODE_NORMAL,
        }
      }
      if(select_uuid) {
        route.query.uuid = select_uuid
      }
      this.$router.push(route)
    }
  },
  watch: {}
}