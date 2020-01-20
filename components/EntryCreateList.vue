<template lang="pug">
  div
    SingleSelect(
      :options="options"
      force_view="list"
      @selection="selection($event)"
      :select_sync="false"
      :highlight="false"
      :create="true")
</template>

<script>

    import SingleSelect from "./input/SingleSelect";
    import {create_entry} from "../lib/entry";
    import {EDIT} from "../lib/consts";
    import {ENTRIES_SAVE_ENTRY, INIT_PAGE_PATH} from "../lib/store_consts";
    import EntryNavMixin from "./EntryNavMixin";
    import PersistentStorageMixin from "./PersistentStorageMixin";

    const ENTRY_TYPE = "etype";
    const DRAFT = "draft";

    export default {
        name: "EntryCreateList",
        components: {SingleSelect},
        mixins: [EntryNavMixin, PersistentStorageMixin],
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
                    const entry = create_entry(this.$store, value)
                    this.persist_draft_numbers()
                    this.$store.commit(ENTRIES_SAVE_ENTRY, entry)
                    uuid = entry.uuid
                } else {
                    uuid = value
                }
                // console.log("entrycreatelist", this.$route)
                this.$store.commit(INIT_PAGE_PATH, this.$route)
                this.to_entry(uuid, EDIT)
            }
        }
    }
</script>

<style scoped>
</style>
