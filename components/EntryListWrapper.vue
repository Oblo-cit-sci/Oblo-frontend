<template lang="pug">
  v-container(fluid)
    v-row(wrap justify-start)
    v-row(v-if="prepend_query")
      v-col(offset="5" cols=2)
        v-progress-circular(indeterminate center size="35" color="success")
    EntryPreviewList(v-if="!prepend_query"
      :entries="entries"
      :requesting_entries="quering"
      :total_count="total_count"
      :preview_options="null"
      @preview_action="$emit('preview_action',$event)"
      @request_more="request_more")
</template>

<script>

  // like Search, but with fixed params (no text field)
  import {debounced_search, search_entries} from "../lib/client"
  import EntryPreviewList from "./EntryPreviewList"

  export default {
    name: "EntryListWrapper",
    components: {EntryPreviewList},
    props: {
      configuration: Object,
    },
    data() {
      return {
        entries: [],
        prepend_query: false,
        quering: false,
        total_count: null
      }
    },
    created() {
      this.prepend_query=true
      this.request_more().then(() => {
        this.prepend_query=false
      })
    },
    methods: {
      async request_more() {
        this.searching = true
        const offset = this.entries.length
        const new_entries = await search_entries(this.$api, null, this.configuration, offset)
        console.log("new entries", new_entries)
        this.entries = this.$_.concat(this.entries, new_entries.entries)
        if(this.total_count === null) {
          this.total_count = new_entries.count
        }
      }
    }
  }
</script>

<style scoped>

</style>
