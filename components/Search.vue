<template lang="pug">
    v-container(fluid)
        v-row(wrap justify-start)
            v-col(cols="12")
                v-text-field(
                    v-model="keyword"
                    label="Buscar"
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
    import {search_entries} from "../lib/client";

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
          if(this.init_clear) {
              this.clear()
          }
        },
        watch: {
            keyword: function (newKeyword, oldKeyword) {
                if(this.keyword !== null && this.keyword.length >= 4) {
                    this.$_.debounce(this.getEntries, 500)()
                }
            }
        },
        computed: {
            ...mapGetters({entries: 'search/get_entries'}),
        },
        methods: {
            getEntries() {
                this.searching = true
                search_entries(this.$axios, this.$store, this.keyword)
                    .then(res => {
                        this.searching = false
                        this.$emit("received_search_results", this.entries)
                    }).catch(err => {
                        console.log('Error getting entries')
                        this.searching = false
                    })
            },
            ...mapMutations({"clear": "search/clear"})
        }
  }
</script>

<style scoped>

</style>

