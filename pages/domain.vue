<template lang="pug">
  v-container(fluid)
    div(class="header-domain")
      p.display-1 {{domain_data.page_index.title}}
      p.heading {{domain_data.page_index.description}}
    div
      p
        h3 {{domain_data.page_index.action_text}}
      v-divider
      EntryCreateList(:entrytypes_entries="entrytypes_entries")
    Search(
      :init_clear="false"
      :fixed_filters="domain_pre_filter",
      :mixin_domain_drafts="domain_name",
      :include_filters="filters")
</template>

<script>

  import EntryCreateList from "../components/EntryCreateList";
  import {global_context_filter} from "../lib/search";
  import Search from "../components/Search";
  import {entrytype_filter_options} from "../lib/filter_option_consts";

  import {mapGetters} from "vuex"
  import {DOMAIN, DOMAIN_BY_NAME, SET_DOMAIN} from "../store";
  import {TEMPLATES_OF_DOMAIN} from "../store/templates";
  import {USER_LOGGED_IN} from "../store/user";

  export default {
    name: "domain",
    components: {EntryCreateList, Search},
    created() {
      if (this.domain_data.name !== this.$store.getters[DOMAIN]) {
        this.$store.commit(SET_DOMAIN, this.domain_data)
      }
    },
    computed: {
      ...mapGetters({logged_in:USER_LOGGED_IN}),
      domain_name() {
        return this.$route.query.d
      },
      entrytypes_entries() {
        return global_context_filter(this.$store.getters[TEMPLATES_OF_DOMAIN](this.domain_name))
      },
      domain_data() {
        return this.$store.getters[DOMAIN_BY_NAME](this.domain_name)
      },
      filters() {
        return [entrytype_filter_options]
      },
      domain_pre_filter() {
        return [{
          name: "meta",
          column: DOMAIN,
          conditional_value: this.domain_data.name
        }]
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
