<template lang="pug">
  v-container(fluid)
    v-row
      FilterSelect(v-bind="domain_filter_options" :selection.sync="selected_domain", :init_selection="$store.getters.domain")
    EntryPreviewList(:entries="entries" :include_domain_tag="all_domains")
</template>

<script>
    import Entrypreview from "../components/EntryPreview";
    import EntryPreviewList from "../components/EntryPreviewList";
    import {ENTRIES_ALL_ENTRIES_ARRAY} from "../lib/store_consts";
    import FilterSelect from "../components/FilterSelect";
    import {entries_domain_filter2} from "../lib/search";
    import {NO_DOMAIN} from "../lib/consts";
    import {domain_filter_options} from "../lib/filter_option_consts";
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
        components: {FilterSelect, EntryPreviewList, Entrypreview},
        data() {
            return {
                filter_options: options,
                filter: ["all"],
                selected_domain: undefined // dont change to null, v-select will set it undefined  when cleared
            }
        },
        computed: {
            all_domains() {
              return this.selected_domain === undefined || this.selected_domain.value === NO_DOMAIN
            },
            entries() {
                let result_entries = this.$store.getters[ENTRIES_ALL_ENTRIES_ARRAY]()
                if(!this.all_domains)
                  result_entries = entries_domain_filter2(result_entries, this.selected_domain.value, this.$store.getters.entrytypes)
                /* this is the roles filter... not in use atm
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
                 */
                return result_entries
            },
            roles() {
                this.$_.map(options, (o) => {
                    return o.value
                });
            },
            domain_filter_options() {
                return domain_filter_options
            }
        }
    }
</script>

<style scoped>

</style>
