<template lang="pug">
  v-container(fluid)
    v-row(wrap justify-start)
    v-row(v-if="prepend_query")
      v-col(offset="5" cols=2)
        v-progress-circular(indeterminate center size="35" color="success")
    EntryPreviewList(v-if="!prepend_query && normal_mode"
      :entries="entries_uuids"
      :total_count="total_count"
      :preview_options="preview_options"
      @request_more="request_more()"
      @preview_action="$emit('preview_action',$event)")
    CompactEntryList(v-if="!prepend_query && !normal_mode"
      :entries="entries_uuids"
      :total_count="total_count"
      @preview_action="$emit('preview_action',$event)")
</template>

<script>

// like Search, but with fixed params (no text field)
import EntryPreviewList from "./entry/EntryPreviewList"
import TriggerSnackbarMixin from "./TriggerSnackbarMixin"
import CompactEntryList from "~/components/entry/CompactEntryList"
import EntrySearchMixin from "~/components/EntrySearchMixin"
import FilterMixin from "~/components/FilterMixin"
import EntryFetchMixin from "~/components/entry/EntryFetchMixin";

export default {
  name: "EntryListWrapper",
  mixins: [TriggerSnackbarMixin, EntrySearchMixin, FilterMixin, EntryFetchMixin],
  components: {CompactEntryList, EntryPreviewList},
  props: {
    view_mode: {
      type: String,
      default: "normal"
    }, // "normal" default, "compact"
    search_config: Array,
    init_request: Boolean,
    wait: Boolean, // created but parent still waits for other data, so show loading,
    preview_options: Object,
    templates_codes_loaded: false
  },
  data() {
    return {
      entries_uuids: [],
      prepend_query: false,
      quering: false,
      total_count: null
    }
  },
  created() {
    this.prepend_query = true
    if (this.init_request) {
      this.request_more()
    }
  },
  methods: {
    async request_more() {
      // console.log("request more")
      this.searching = true
      // console.log("conf", conf)
      const search_config = this.build_search_config(this.search_config)
      this.async_entry_search(search_config, this.entries_uuids.length).then(async ({data}) => {
        const result = data.data
        if (!this.$_.isEmpty(result.entries)) {
          console.log("WAAAITING FOR TEMPLATES")
          await this.guarantee_templates_codes(result.entries, this.$store.getters.domain_language)
        }
        const entry_uuids = this.store_received_entries(result.entries)
        if (this.$_.isEmpty(this.entries_uuids)) {
          // const local_search_config = this.search_config
          // console.log(local_search_config)
          const has_local_filter = this.has_local_filter(this.search_config)
          if (has_local_filter) {
            const local_entries_uuids = this.local_search(this.search_config).reverse()
            this.entries_uuids = this.$_.concat(this.entries_uuids, local_entries_uuids)
          }
        }
        this.entries_uuids = this.$_.concat(this.entries_uuids, entry_uuids)

        if (this.total_count === null) {
          this.total_count = result.count
        }
      }).catch(err => {
        console.log(err)
        this.error_snackbar("Could not fetch entries")
      }).finally(() => {
        this.searching = false
        this.prepend_query = false
      })
    }
  },
  computed: {
    normal_mode() {
      return this.view_mode === "normal"
    },
    query_config() {
      return this.configuration.filter(f, f.source !== "local")
    }
  },
  watch: {
    wait() {
      this.request_more()
    }
  }
}
</script>

<style scoped>

</style>
