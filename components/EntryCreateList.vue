<template lang="pug">
  div
    SingleSelect(
      :options="options"
      force_view="list"
      @selection="selection($event)"
      :select_sync="false"
      :highlight="false"
      only_value
      :create="true")
</template>

<script>

    import SingleSelect from "./input/SingleSelect";
    import {create_entry} from "~/lib/entry";
    import {EDIT} from "~/lib/consts";
    import EntryNavMixin from "./EntryNavMixin";
    import PersistentStorageMixin from "./util/PersistentStorageMixin";
    import {ENTRIES_SAVE_ENTRY} from "~/store/entries";
    import {INIT_PAGE_PATH} from "~/store";

    const ENTRY_TYPE = "etype";
    const DRAFT = "draft";

    export default {
        name: "EntryCreateList",
        components: {SingleSelect},
        mixins: [EntryNavMixin, PersistentStorageMixin],
        props: {
            template_entries: {
                type: Array,
                required: true
            }
        },
        computed: {
            options() {
                return this.$_.map(this.template_entries, o => {
                    return {
                        text: o.title,
                        value: o.slug,
                        type: ENTRY_TYPE,
                        description: o.description,
                    }
                })
            }
        },
        methods: {
            selection(slug) {
                let uuid = null
                if (type === ENTRY_TYPE) {
                    const entry = create_entry(this.$store, slug)
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
