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

    import { mapGetters} from "vuex"
    import Entrypreview from "../components/EntryPreview";
    import {search_entries} from "../lib/client";

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
            //TODO: minimum of 4 characters
            keyword: function (newKeyword, oldKeyword) {
                //TODO: missing debounce function here
                this.getEntries();
            }
        },
        computed: {
            ...mapGetters({entries: 'search/get_entries'}),
        },
        methods: {
            getEntries() {
                console.log("Entries updated with the new search");
                //Call
                search_entries(this.$axios, this.$store, this.keyword);
            },
            appendIconCallback () {
                alert('click:append')
            }

        }
  }
</script>

<style scoped>

</style>

