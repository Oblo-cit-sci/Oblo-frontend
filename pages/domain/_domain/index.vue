<template lang="pug">
    EntryCreateList(
      :entrytypes_entries="entrytypes_entries"
      @selection="")
</template>

<script>

    import EntryCreateList from "../../../components/EntryCreateList";
    import {global_context_filter} from "../../../lib/search";
    import {ENTRYTYPES_OF_DOMAIN} from "../../../lib/store_consts";

export default {
      name: "index",
      components: {EntryCreateList},
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
