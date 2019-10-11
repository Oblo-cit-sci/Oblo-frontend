<template lang="pug">
  div
    SingleSelect(
      :options="options"
      force_view="list"
      @selection="selection($event)"
      :select_sync="false"
      :highlight="false")
</template>

<script>

    import SingleSelect from "./SingleSelect";
    import {create_entry} from "../lib/entry";

    const ENTRY_TYPE = "etype";
    const DRAFT = "draft";

    export default {
        name: "EntryCreateList",
        components: {SingleSelect},
        props: {
            entrytypes_entries: {
                type: Array,
                required: true
            },
            draft_entries: {
                type: Array
            }
        },
        computed: {
            options() {
                let options = this.$_.map(this.entrytypes_entries, o => {
                    return {
                        text: o.title,
                        value: o.slug,
                        type: ENTRY_TYPE,
                        description: o.description,
                    }
                })

                console.log(this.draft_entries)

                let drafts = this.$_.map(this.draft_entries, d => {
                    return {
                        text: d.title,
                        value: d.uuid,
                        type: DRAFT,
                        description: "Created " + format(d.creation_datetime)
                    }
                })
                if (drafts.length > 0) {
                    options.push({text: "Drafts", type: "category"}, ...drafts)
                }
                return options
            }
        },
        methods: {
            selection({type, value}) {
                let uuid = null
                if (type === ENTRY_TYPE) {
                    uuid = create_entry(this.$store, value).uuid
                } else {
                    uuid = value;
                }
                this.$router.push("/entry/" + uuid)
            }
        }
    }
</script>

<style scoped>

</style>
