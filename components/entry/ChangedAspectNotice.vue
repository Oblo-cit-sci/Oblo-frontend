<template lang="pug">
  div
    h3 Changes
    v-row.ml-0(v-for="change in changes" :key="change") {{change}}
</template>

<script>
  import {ENTRIES_GET_EDIT, ENTRIES_GET_ENTRY} from "~/store/entries";
  import {compare_entries} from "~/lib/entry_collections";

  export default {
    name: "ChangedAspectNotice",
    computed: {
      changes() {
        const edit_entry = this.$store.getters[ENTRIES_GET_EDIT]()
        const original_entry = this.$store.getters[ENTRIES_GET_ENTRY](edit_entry.uuid)
        return compare_entries(original_entry, edit_entry)
      },
    }
  }
</script>

<style scoped>

</style>
