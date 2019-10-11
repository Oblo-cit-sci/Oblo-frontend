<template lang="pug">
  v-layout(justify-center)
    v-flex(xs12 md8)
      EntryCreateList(
        :entrytypes_entries="entrytypes"
        :draft_entries="drafts")
</template>

<script>


    import {format} from 'timeago.js';
    import {ENTRIES_DRAFTS} from "../lib/store_consts";
    import EntryCreateList from "../components/EntryCreateList";

    const ENTRY_TYPE = "etype";
    const DRAFT = "draft";

    export default {
        name: "CreateEntry",
        components: {EntryCreateList},
        methods: {
        },
        computed: {
            entrytypes() {
                return this.$store.getters.global_entry_types_as_array
            },
            drafts() {
                let drafts = this.$store.getters[ENTRIES_DRAFTS]
                let slugs = this.$_.map(this.entrytypes, et => et.slug)
                return this.$_.filter(drafts, e => this.$_.includes(slugs,e.type_slug))
            }
        }
    }
</script>

<style scoped>


</style>
