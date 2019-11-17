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
    v-row
      v-col.col-md-6.col-xs-12(cols="12")
        FilterSelect(
          filter_name="Entrytype"
          store_getter="search/conaining_types_options"
          :selection.sync="type_filter"
          placeholder="All types")
    EntryPreviewList(v-if="show_results" :entries="filtered_entries" :preview_options="preview_options")
</template>

<script>

    import {mapGetters, mapMutations} from "vuex"
    import EntryPreviewList from "../components/EntryPreviewList"
    import {search_entries} from "../lib/client"
    import {ENTRIES_SEARCH, CLEAR_SEARCH} from "../lib/store_consts"
    import FilterSelect from "./FilterSelect";

    export default {
        name: "Search",
        components: {FilterSelect, EntryPreviewList},
        props: {
            init_clear: Boolean,
            show_results: {
                type: Boolean,
                default: true
            },
            preview_options: {
                type: Object
            }
        },
        data() {
            return {
                searching: false,
                keyword: '',
                type_filter: null
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
            filtered_entries() {
                if(!this.type_filter) {
                    return this.entries
                } else {
                    return this.$_.filter(this.entries, e => e.type_slug === this.type_filter.value)
                }
            }
        },
        methods: {
            getEntries() {
                this.searching = true
                let config = this.searchConfiguration()
                // build_config merges 2 objects,
                //console.log("search.getEntries: config", config)
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

