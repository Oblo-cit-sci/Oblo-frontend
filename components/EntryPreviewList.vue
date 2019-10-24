<template lang="pug">
    v-row(wrap justify-center)
      v-col(cols=12 v-for="entry in visible_entries"
          :key="entry.id" class="col-sm-12 col-xs-6")
          Entrypreview(:entry="entry")
      v-col(v-if="has_entries")
        v-Pagination(v-if="entries.length>20" v-model="page"
                     :length="num_pages"
                     total-visible="10")
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
            }, 

        },
        created() {
        },
        watch: {
            entries: function() {
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
                let index1 = (this.page -1)*this.entries_per_page
                let index2 = this.entries_per_page * this.page
                return this.entries.slice(index1, index2)
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
