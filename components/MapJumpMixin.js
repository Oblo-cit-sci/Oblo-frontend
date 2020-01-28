import {MAP_GOTO_LOCATION, MAP_LAST_GOTO_LOCATION} from "~/lib/store_consts";

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
    goto_next_location(location) {
      const act_loc = this.$store.getters[MAP_LAST_GOTO_LOCATION]()
      const index = this.$_.findIndex(location, (l) => l === act_loc)
      const next_index = (index + 1) % location.length
      this.$store.commit(MAP_GOTO_LOCATION, location[next_index])
    },
  },
  watch: {}
}
