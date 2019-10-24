<template lang="pug">
  v-container(fluid)
    v-layout(row wrap justify-start)

      EntryPreviewList(:entries="entries")

</template>

<script>
    import Entrypreview from "../components/EntryPreview";
    import EntryPreviewList from "../components/EntryPreviewList";
    import {ENTRIES_ALL_ENTRIES_ARRAY} from "../lib/store_consts";

    /*
    v-flex(
        v-for="o in filter_options" :key="o.value")
        v-checkbox(
          v-model="filter"
          :label="o.label"
          :value="o.value")

     */


    const options = [
        {
            label: "All",
            value: "all"
        },
        {
            label: "Owner",
            value: "owners"
        },
        {
            label: "Reviewer",
            value: "reviewers"
        },
        {
            label: "Explicit access",
            value: "explicit_access"
        },
        {
            label: "Collaborator",
            value: "collaborators"
        }
    ];



    export default {
        name: "PersonalEntries",
        components: {EntryPreviewList, Entrypreview},
        data() {
            return {
                filter_options: options,
                filter: ["all"]
            }
        },
        computed: {
            entries() {
                let result_entries = this.$store.getters[ENTRIES_ALL_ENTRIES_ARRAY]()
                if (this.filter.length !== 1) {
                    if (this.$_.last(this.filter) === "all") {
                        this.filter = ["all"]
                        //console.log(this.$store.state.entries)
                    } else {
                        if (this.filter[0] === "consoleall") {
                            this.filter.shift()
                        }
                    }
                }
                return result_entries
            },
            roles() {
                this.$_.map(options, (o) => {
                    return o.value
                });
            }
        }
    }
</script>

<style scoped>

</style>
