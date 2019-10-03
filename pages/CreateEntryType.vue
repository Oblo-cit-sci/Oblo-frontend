<template lang="pug">
  div
    Title_Description(title="Create new entrytypes" header_type="h1")
    div
      h4 Load a existing type
      SingleSelect(
        :options="existing_types"
        :select_sync="false"
        @selection="select_exisisting($event)"
        :only_value="true")
    div Select mode
      SingleSelect(:options="mode_options"  :selection="mode" force_view="radiogroup" :only_value="true")
    EntryAspectView(:entry="entry")
</template>

<script>
    import Title_Description from "../components/Title_Description";
    import SingleSelect from "../components/SingleSelect";
    import {object_list2options, string_list2options} from "../lib/client";
    import {create_entry} from "../lib/entry";
    import EntryAspectView from "../components/EntryAspectView";

    export default {
        name: "CreateEntryType",
        components: {EntryAspectView, SingleSelect, Title_Description},
        mixins: [],
        data() {
            return {
                existing_types: [],
                mode_options: string_list2options(['edit', 'view', 'mixed']),
                mode: "view",
                entry: null,
            }
        },
        created() {
            this.existing_types = object_list2options(Array.from(this.$store.state.entry_types.values()), "title", "slug", true)
        },
        methods: {
            select_exisisting(event) {
                this.entry = create_entry(this.$store, event)
            }
        },
        computed: {}
    }
</script>

<style scoped>

</style>
