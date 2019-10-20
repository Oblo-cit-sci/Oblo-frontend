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
        v-row(wrap justify-center)
            v-col(cols=12 v-for="entry in entries"
                :key="entry.id" class="col-sm-12 col-xs-6")
                Entrypreview(:entry="entry")
</template>

<script>

    import { mapGetters} from "vuex"
    import Entrypreview from "../components/EntryPreview";
    import {search_entries} from "../lib/client";
    import {mapMutations} from "../_node_modules/vuex";

    export default {
        name: "Search",
        components: {Entrypreview},
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
              console.log("clear")
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

