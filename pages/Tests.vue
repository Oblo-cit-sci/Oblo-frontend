<template lang="pug">
  v-container(fluid)
    v-row
      v-col(xs12 sm8 md12)
        div
      v-col(cols=12 v-for="entry in entries"
        :key="entry.id" class="col-sm-12 col-xs-12")
        Entrypreview(:entry="entry")
</template>

<script>

    import {mapGetters} from "vuex";
    import Entrypreview from "../components/EntryPreview";

    const ld = require("lodash")

    export default {
        name: "Tests",
        components: {Entrypreview},
        mounted () {
            let name = this.$vuetify
        },
        created() {
        },
        data() {
            return {}
        },
        computed: {
            ...mapGetters({entries: "entries/all_entries_array"}),

        },
        methods: {}
    }
</script>

<style scoped>

</style>
