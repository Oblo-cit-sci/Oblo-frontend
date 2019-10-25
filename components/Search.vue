<template lang="pug">
  v-container(fluid)
    v-row(wrap justify-start)
      v-col(cols="12")
        v-text-field(
          v-model="keyword"
          label="Search"
          single-line
          hide-details
          append-outer-icon="search"
          @click:append-outer="getEntries"
          clearable
          :loading="searching")
    EntryPreviewList(:entries="entries")
</template>

<script>

    import {mapGetters, mapMutations} from "vuex"
    import EntryPreviewList from "../components/EntryPreviewList"
    import {search_entries} from "../lib/client"
    import {ENTRIES_SEARCH, CLEAR_SEARCH} from "../lib/store_consts"

    export default {
        name: "Search",
        components: {EntryPreviewList},
        props: {
            init_clear: Boolean
        },
        data() {
            return {
                searching: false,
                keyword: ''
            }
        },
        created() {
            if (this.init_clear) {
                this.clear()
            }
            if (this.entries.length === 0) {
                this.getEntries()
            }
        },
        watch: {
            keyword: function (kw) {
                // !kw covers: kw === null || kw === "", which can both occur, (clear and deleting all manually)
                if (!kw) {
                    // TODO
                    // this uses now, the domain only filter.
                    // could later be replaced by, last search or all local in that domain (like it is now)
                    this.getEntries()
                } else if (kw.length >= 4) {
                    this.$_.debounce(this.getEntries, 500)()
                }
            }
        },
        computed: {
            ...mapGetters({entries: ENTRIES_SEARCH}),
        },
        methods: {
            getEntries() {
                this.searching = true
                let config = this.searchConfiguration()
                // build_config merges 2 objects,
                search_entries(this.$axios, this.$store, config)
                    .then(res => {
                        this.searching = false
                        this.$emit("received_search_results", this.entries)
                    }).catch(err => {
                    console.log('Error getting entries')
                    this.searching = false
                })
            },
            ...mapMutations({"clear": CLEAR_SEARCH}),
            searchConfiguration(
                domain = this.$store.state.domain.value
            ) {
                let configuration = {
                    required: {
                        domain: domain
                    },
                    include: {}
                }

                if (this.keyword) {
                    for (let default_search_part of ["title", "tags", "aspect_search"]) {
                        configuration.include[default_search_part] = this.keyword
                    }
                }
                return configuration
            }
        }
    }
</script>

<style scoped>

</style>

