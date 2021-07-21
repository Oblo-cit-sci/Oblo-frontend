import {mapGetters} from "vuex"
import EntrySearchMixin from "~/components/EntrySearchMixin"
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";

export default {
  name: "MapEntriesMixin",
  mixins: [EntrySearchMixin, TriggerSnackbarMixin],
  computed: {
    ...mapGetters({
      entries_loaded: "map/entries_loaded",
      all_map_entries: "map/entries",
      all_uuids: "search/get_all_uuids",
      get_search_time: "map/get_search_time"
    }),
    get_all_uuids() {
      return this.all_uuids()
    },
  },
  methods: {
    async load_map_entries(domain_name) {
      this.$store.commit("map/set_entries_loaded", false)
      const template_filter = Object.assign(this.$_.cloneDeep(this.get_template_filter_options().search_config),
        {value: this.domain_templates_slugs(true)})
      const config = {
        required: [template_filter] // this.act_config // this.get_domain_filter(domain_name)
      }
      if (!this.$_.isEmpty(this.entries)) {
        if (this.get_search_time) {
          config.required.push({name: "before_ts", value: this.get_search_time})
        }
      }
      try {
        const {data} = await this.$api.entries.map_entries(config, true)
        await this.$store.dispatch("map/add_entries", {
          domain: domain_name,
          entries: data.data.entries,
          ts: data.data.ts
        })
      } catch (e) {
        // console.log("error", e)
        this.error_snackbar("EN/map entries loading failed")
        await this.$store.dispatch("map/add_entries", {domain: domain_name, entries: {"features": []}, ts: null})
      }
    },
    get_my_locations() {
      // this.guarantee_entries_loaded()
      const my_uuids = this.get_my_entries_uuids()
    },
    get_map_entries_by_uuids(uuids) {
      // this.guarantee_entries_loaded()
      return this.$store.getters["map/get_by_uuids"](uuids)
    }
  }
}
