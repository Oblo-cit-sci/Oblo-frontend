<template lang="pug">
  v-container(fluid)
    v-row(wrap justify-start)
    v-row(v-if="prepend_query")
      v-col(offset="5" cols=2)
        v-progress-circular(indeterminate center size="35" color="success")
    EntryPreviewList(v-if="!prepend_query"
      :entries="entries_uuids"
      :requesting_entries="quering"
      :total_count="total_count"
      :preview_options="null"
      @preview_action="$emit('preview_action',$event)"
      @request_more="request_more")
</template>

<script>

  // like Search, but with fixed params (no text field)
  import EntryPreviewList from "./entry/EntryPreviewList"
  import {async_entry_search, process_cachable_entries} from "../lib/client"
  import TriggerSnackbarMixin from "./TriggerSnackbarMixin"

  export default {
    name: "EntryListWrapper",
    mixins: [TriggerSnackbarMixin],
    components: {EntryPreviewList},
    props: {
      configuration: Object,
      init_request: Boolean,
      wait: Boolean, // created but parent still waits for other data, so show loading
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
      if(this.init_request) {
        this.request_more()
      }
    },
    methods: {
      request_more() {
        this.searching = true
        const conf = Object.assign(this.configuration, {
          page: {
            offset: this.entries_uuids.length
          }
        })
        console.log("conf", conf)
        async_entry_search(this.$api, conf).then(({data}) => {
          const result = data.data
          const entry_uuids = process_cachable_entries(this.$store, result.entries)
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
    watch: {
      wait() {
        this.request_more()
      }
    }
  }
</script>

<style scoped>

</style>
