<template lang="pug">
  v-container(fluid)
    div(class="header-domain")
      p.display-1 {{domain_data.page_index.title}}
      p.heading {{domain_data.page_index.description}}
    v-divider
    EntryCreateList(
      :entrytypes_entries="entrytypes_entries")
    Search(:init_clear="true")
</template>

<script>

    import EntryCreateList from "../../../components/EntryCreateList";
    import {global_context_filter} from "../../../lib/search";
    import Search from "../../../components/Search";
    import {ENTRYTYPES_OF_DOMAIN, DOMAIN, DOMAIN_BY_NAME, SET_DOMAIN} from "../../../lib/store_consts";
    import {get_release_mode} from "../../../lib/util";
    import {LICCI_PARTNERS} from "../../../lib/consts";

    export default {
        name: "index",
        components: {EntryCreateList, Search},
        created() {
          if(this.domain_data.value !== this.$store.getters[DOMAIN]) {
              this.$store.commit(SET_DOMAIN, this.domain_data)
          }
        },
        data() {
            return {}
        },
        computed: {
            entrytypes_entries() {
                return global_context_filter(this.$store.getters[ENTRYTYPES_OF_DOMAIN](this.$route.params.domain))
            },
            domain_data() {
                return this.$store.getters[DOMAIN_BY_NAME](this.$route.params.domain)
            }
        },
        methods: {},
        watch: {}
    }
</script>

<style scoped>
  .header-domain {
    background-color: white;
    padding: 10px;
  }
</style>
