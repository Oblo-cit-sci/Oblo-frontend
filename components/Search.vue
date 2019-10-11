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
                    clearable)
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
                keyword: '',
            }
        },
        watch: {
            // whenever text-field changes, this function will run
            keyword: function (newKeyword, oldKeyword) {
                //missing debounce function here
                this.getEntries();
            }
        },
        computed: {
            entries() {
                return  Array.from(this.$store.state.global_entries.values());
            }
        },
        methods: {
            getEntries() {
                console.log("Entries updated with the new search");
                //Call 
                search_entries(this.$axios, this.$store);
            },
            appendIconCallback () {
                alert('click:append')
            }
        
        }
  }
</script>

<style scoped>

</style>

