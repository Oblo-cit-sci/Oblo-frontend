<template lang="pug">
  v-container(fluid)
    Search(
      :include_filters="filters"
      :view_mode.sync="entries_view")
</template>

<script>
    import {LICCI_PARTNERS, NO_DOMAIN, VIEW_SEARCH} from "../lib/consts";
    import {domain_filter_options, entrytype_filter_options} from "../lib/filter_option_consts";
    import FilterMixin from "../components/FilterMixin";
    import {pack_value} from "../lib/aspect";
    import {get_release_mode} from "../lib/util";
    import Search from "../components/Search";
    import {ENTRIES_ALL_ENTRIES_ARRAY} from "../store/entries";



    let all_filters = [domain_filter_options, entrytype_filter_options]

    export default {
        name: "PersonalEntries",
        components: {Search},
        mixins: [FilterMixin],
        data() {
            let filters = all_filters
            if (get_release_mode(this.$store) === LICCI_PARTNERS) {
                filters = all_filters.filter(f => f.name !== "Domain")
            }
            return {
                filters: filters,
                filter_values: {},
            }
        },
        computed: {
            all_domains() {
                const value = this.filter_values["Domain"]
                return value === undefined || value === NO_DOMAIN
            },
            // todo this is a duplicate
            entries_view: {
                get: function () {
                    return this.$route.query.view || VIEW_SEARCH
                },
                set: function (view) {
                    let route = {
                        path: this.$route.path,
                        query: {
                            view: view,
                        }
                    }
                    this.$router.push(route)
                }
            },
            entries() {
                let result_entries = this.$store.getters[ENTRIES_ALL_ENTRIES_ARRAY]()

                for (let filter of all_filters) {
                    //todo we select the value, because select is not just emitting value up, clean this!
                    const filter_value = (this.filter_values[filter.name] || pack_value(null)).value
                    if (filter_value) {
                        result_entries = this[filter.filter_method](result_entries, filter_value)
                    }
                }
                return result_entries
            }
        }
    }
</script>

<style scoped>

</style>
