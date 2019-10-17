<template lang="pug">
  v-container(fluid)
    v-layout(row wrap justify-start)
      v-flex(
        v-for="o in filter_options" :key="o.value")
        v-checkbox(
          v-model="filter"
          :label="o.label"
          :value="o.value")
    v-row(wrap justify-center)
      v-col(cols=12 v-for="entry in entries"
        :key="entry.uuid" class="col-sm-6 col-xs-12")
        Entrypreview(:entry="entry")

</template>

<script>
    import Entrylist from "../components/Entrylist";
    import Entrypreview from "../components/EntryPreview";
    import {ENTRIES_ALL_ENTRIES_ARRAY} from "../lib/store_consts";

    const ld = require("lodash");

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

    const roles = ld.map(options, (o) => {
        return o.value
    });

    export default {
        name: "PersonalEntries",
        components: {Entrylist, Entrypreview},
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
            }
        }
    }
</script>

<style scoped>

</style>
