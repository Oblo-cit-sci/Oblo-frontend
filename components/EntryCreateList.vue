<template lang="pug">
  div
    SingleSelect(
      :options="options"
      force_view="list"
      @selection="create_entry($event)"
      :select_sync="false"
      :highlight="false"
      only_value
      :create="true")
</template>

<script>

  import SingleSelect from "./input/SingleSelect";
  import EntryNavMixin from "./EntryNavMixin";
  import EntryCreateMixin from "~/components/entry/EntryCreateMixin"

  const ENTRY_TYPE = "etype";
  const DRAFT = "draft";

  export default {
    name: "EntryCreateList",
    components: {SingleSelect},
    mixins: [EntryNavMixin, EntryCreateMixin],
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
            description: o.description,
          }
        })
      }
    },
  }
</script>

<style scoped>
</style>
