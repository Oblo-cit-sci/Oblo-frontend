<template lang="pug">
  v-list(dense)
    template(v-for="uuid in visible_entries")
      CompactEntry(:passed_uuid="uuid" :key="uuid")
      v-divider
</template>

<script>
  import CompactEntry from "~/components/entry/CompactEntry"

  export default {
    name: "CompactEntryList",
    mixins: [],
    components: {CompactEntry},
    props: {
      entries: Array,
      total_count: Number,
      entries_per_page: {
        type: Number,
        default: 20
      },
    },
    data() {
      return {
        page: 1,
        deleted: []
      }
    },
    computed: {
      visible_entries() {
        let from_index = (this.page - 1) * this.entries_per_page
        let to_index = from_index + this.entries_per_page
        const entries = this.entries.slice(from_index, to_index)
        return this.$_.filter(entries, e => !this.deleted.includes(e.uuid))
      }
    },
    methods: {

    }
  }
</script>

<style scoped>

</style>
