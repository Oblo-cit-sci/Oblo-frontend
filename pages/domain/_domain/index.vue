<template lang="pug">
    v-container(fluid)
        div(class="header-domain")
            p.display-1 {{domain_data.page_index.title}}
            p.heading {{domain_data.page_index.description}}
        v-divider
        EntryCreateList(
            :entrytypes_entries="entrytypes_entries")
        Search
</template>

<script>

    import EntryCreateList from "../../../components/EntryCreateList";
    import {global_context_filter} from "../../../lib/search";
    import Search from "../../../components/Search";
    import {ENTRYTYPES_OF_DOMAIN, DOMAIN} from "../../../lib/store_consts";

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
        }, 
        domain_data() {
            return this.$store.getters[DOMAIN]
        }
      },
      methods: {

      },
      watch: {

      }
}
</script>

<style scoped>
    .header-domain {
        background-color: white;
        padding: 10px;
    }
</style>
