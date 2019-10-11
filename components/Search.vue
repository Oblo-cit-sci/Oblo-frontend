<template lang="pug">
    v-container
        v-row(wrap justify-start)
            v-col(cols="12" md="10")
                v-text-field(
                    v-model="keyword"
                    clearable
                    label="Buscar"
                    single-line
                    hide-details)
            v-col(cols="12" md="2")
                v-btn(
                    color="success"
                    @click="getEntries"
                    :loading="searching") BUSCAR
        Entrypreview(:entries="entries")
</template>

<script>
    import axios from "axios";
    import Entrypreview from "../components/EntryPreview";

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
                return  Array.from(this.$store.state.entries.entries.values())
            }
        },
        methods: {
            getEntries: function () {
                console.log("Entries updated with the new search");
                //this.searching = true;
                //var vm = this

                //axios.get('', {
                  //  params: {
                    //    keyword:keyword
                    //}
                //}).then(function (response) {
                  //  vm.searching = false;
                    //console.log("data",response)
                //}).catch(function (error) {
                    //vm.searching = false;
                    //console.log("error",error)
                //})
            }
        }
  }
</script>

<style scoped>

</style>

