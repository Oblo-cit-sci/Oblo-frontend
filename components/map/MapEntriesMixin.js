import {mapGetters} from "vuex"

export default {
  name: "MapEntriesMixin",
  computed: {
    ...mapGetters({
      entries_loaded: "map/entries_loaded",
      all_map_entries: "map/entries",
      all_uuids: "search/get_all_uuids",
    }),
    get_all_uuids() {
      return this.all_uuids()
    },
  }
}
