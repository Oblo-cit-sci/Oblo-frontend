<template lang="pug">
  v-row(wrap justify-center)
    v-col(cols=12)
        div {{num_entries}} Entries
    v-col(cols=12 v-for="entry in visible_entries"
      :key="entry.id" class="col-sm-12 col-xs-6")
      Entrypreview(:entry="entry" :include_domain_tag="include_domain_tag")
    v-col(v-if="has_entries")
      v-Pagination(v-if="entries.length>20" v-model="page"
        :length="num_pages"
        total-visible="8")
</template>

<script>
    import Entrypreview from "../components/EntryPreview";
    import {TYPE_NAME} from "../lib/store_consts";

    export default {
        name: "EntryPreviewList",
        components: {Entrypreview},
        props: {
            entries: Array,
            entries_per_page: {
                type: Number,
                default: 20
            },
            include_domain_tag: Boolean
        },
        created() {
        },
        watch: {
            entries: function () {
                this.page = 1
            }
        },
        data: function () {
            return {
                recent: {},
                page: 1
            }
        },
        computed: {
            visible_entries() {
                let from_index = (this.page - 1) * this.entries_per_page
                let to_index = from_index + this.entries_per_page
                return this.entries.slice(from_index, to_index)
            },
            num_pages() {
                return Math.ceil(this.num_entries / this.entries_per_page)
            },
            has_entries() {
                return this.num_entries > 0
            },
            num_entries() {
                return this.entries.length
            },
            // could be in some mixin
            set_of_types() {
                return Array.from(
                    new Set(
                        this.$_.map(
                            this.entries,
                            e => this.$store.getters[TYPE_NAME](e.type_slug))).values())
            }
        }
    }
</script>

<style scoped>
</style>
