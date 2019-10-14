<template lang="pug">
    v-container
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
        Entrypreview(:entries="entries")
</template>

<script>
    import axios from "axios";
    import Entrypreview from "../components/EntryPreview";
    import {search_entries} from "../lib/client";
    const ld = require('lodash');

    export default {
        name: "Search",
        components: {Entrypreview},
        data() {
            return {
                searching: false,
                keyword: ''
            }
        },
        watch: {
            keyword: function (newKeyword, oldKeyword) {
                if(this.keyword !== null && this.keyword.length >= 4) {
                    this.searching = true
                    this.$_.debounce(this.getEntries, 500)()
                }
            }
        },
        computed: {
            entries() {
                return  Array.from(this.$store.getters['search/get_entries'].values());
            }
        },
        methods: {
            getEntries() {
                this.searching = true
                search_entries(this.$axios, this.$store, this.keyword)
                    .then(res => {
                        this.searching = false
                    }).catch(err => {
                        console.log('Error getting entries')
                        this.searching = false
                    })
            }
        }
  }
</script>

<style scoped>

</style>

