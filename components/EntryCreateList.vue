<template lang="pug">
  SingleSelect(
    :options="options"
    force_view="list"
    @selection="create_entry($event)"
    :select_sync="false"
    :highlight="false"
    only_value
    action_icon="mdi-arrow-right-bold")
</template>

<script>

  import SingleSelect from "./input/SingleSelect";
  import EntryNavMixin from "./EntryNavMixin";
  import EntryCreateMixin from "~/components/entry/EntryCreateMixin"
  import LargeSelectList from "~/components/aspect_utils/LargeSelectList"

  const ENTRY_TYPE = "etype";
  const DRAFT = "draft";

  export default {
    name: "EntryCreateList",
    components: {LargeSelectList, SingleSelect},
    mixins: [EntryNavMixin, EntryCreateMixin],
    props: {
      template_entries: {
        type: Array,
        required: true
      },
      prominent_template_names: {
        type: Array,
        default: () => []
      }
    },
    computed: {
      options() {
        return this.$_.map(this.template_entries, o => {
          return {
            text: o.title,
            value: o.slug,
            description: o.description,
          }
        })
      }
    },
  }
</script>

<style scoped>
</style>
