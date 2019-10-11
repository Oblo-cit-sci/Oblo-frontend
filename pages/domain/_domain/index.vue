<template lang="pug">
    v-container(fluid)
        EntryCreateList(
            :entrytypes_entries="entrytypes_entries"
            @selection="")
        Search
</template>

<script>

    import EntryCreateList from "../../../components/EntryCreateList";
    import {global_context_filter} from "../../../lib/search";
    import Search from "../../../components/Search";

export default {
      name: "index",
      components: {EntryCreateList, Search},
      data() {
          return {

          }
      },
      computed: {
          entrytypes_entries() {
            return global_context_filter(this.$store.getters["entrytypes_of_domain"](this.$route.params.domain))
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
