<template lang="pug">
  div
    h3 Changes
    v-row.ml-0(v-for="change in changes" :key="change") {{change}}
</template>

<script>
  import {compare_entries} from "~/lib/entry_collections";

  export default {
    name: "ChangedAspectNotice",
    props: {
      is_draft: Boolean
    },
    computed: {
      changes() {
        const edit_entry = this.$store.getters["entries/get_edit"]()
        const original_entry = this.$store.getters["entries/get_entry"](edit_entry.uuid)
        return compare_entries(original_entry, edit_entry, this.is_draft ? ["values"] : [])
      },
    }
  }
</script>

<style scoped>

</style>
