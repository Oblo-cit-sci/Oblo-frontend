<template lang="pug">
    v-container(fluid)
        EntryCreateList(
            :entrytypes_entries="entrytypes_entries")
        Search
</template>

<script>

    import EntryCreateList from "../../../components/EntryCreateList";
    import {global_context_filter} from "../../../lib/search";
    import Search from "../../../components/Search";
    import {ENTRYTYPES_OF_DOMAIN} from "../../../lib/store_consts";

export default {
      name: "index",
      components: {EntryCreateList, Search},
      data() {
          return {

          }
      },
      computed: {
          entrytypes_entries() {
            return global_context_filter(this.$store.getters[ENTRYTYPES_OF_DOMAIN](this.$route.params.domain))
        }
      },
      methods: {

      },
      watch: {

      }
}
</script>

<style scoped>

</style>
