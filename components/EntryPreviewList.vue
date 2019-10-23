<template lang="pug">
    v-row(wrap justify-center)
      v-col(cols=12 v-for="entry in visible_entries"
          :key="entry.id" class="col-sm-12 col-xs-6")
          Entrypreview(:entry="entry")
      v-col(v-if="has_entries")
        v-Pagination(v-model="page" :length="num_pages")
</template>

<script>
    import {mapGetters} from "vuex"
    import Entrypreview from "../components/EntryPreview";

    export default {
        name: "EntryPreviewList",
        components: {Entrypreview},
        props: {
            entries: Array,
            entries_per_page: {
                type: Number,
                default: 20
            }
        },
        created() {
        },
        data: function () {
            return {
                recent: {},
                page: 0
            }
        },
        computed: {
            visible_entries() {
                return this.$_.filter(this.entries, (_, index) => index >= this.page * this.entries_per_page  && index <  (this.page + 1) * this.entries_per_page)
            },
            num_pages() {
              return Math.ceil(this.entries.length / this.entries_per_page)
            },
            has_entries() {
                return this.entries.length > 0
            }
        }
    }
</script>

<style scoped>
</style>
