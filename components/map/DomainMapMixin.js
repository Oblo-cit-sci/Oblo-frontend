import {MAP_SET_ENTRIES} from "~/store/map"

import {mapGetters} from "vuex"
import FilterMixin from "~/components/FilterMixin"

export default {
  name: "DomainMapMixin",
  mixins: [FilterMixin],
  created() {

  },
  computed: {
    ...mapGetters({
      entries: "map/entries",
      layers: "map/layers",
      layer_status: "map/layer_status"
    }),
  },
  methods: {
    load_map_entries() {
      if (this.$_.isEmpty(this.entries)) {
        console.log("loading entries")
        this.$api.entries_map_entries({required: [this.get_domain_filter(this.domain)]},true).then(({data}) => {
          console.log(data)
          this.$store.dispatch(MAP_SET_ENTRIES, {domain: this.domain, entries: data})
        }).catch(err => {
          console.log("map entries error")
        })
      }
    }
  }
}
