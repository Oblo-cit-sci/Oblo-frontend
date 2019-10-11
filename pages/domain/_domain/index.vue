<template lang="pug">
    EntryCreateList(
      :entrytypes_entries="entrytypes_entries"
      @selection="")
</template>

<script>

    import EntryCreateList from "../../../components/EntryCreateList";
    import {global_context_filter} from "../../../lib/search";

export default {
      name: "index",
      components: {EntryCreateList},
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
