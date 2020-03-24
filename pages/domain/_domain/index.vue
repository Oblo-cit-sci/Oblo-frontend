<template lang="pug">
  v-container(fluid)
    div(class="header-domain")
      p.display-1 {{domain_data.page_index.title}}
      p.heading {{domain_data.page_index.description}}
    p
      h3 {{domain_data.page_index.action_text}}
    v-divider
    EntryCreateList(
      v-if="logged_in"
      :entrytypes_entries="entrytypes_entries")
    div.mt-2(v-else)
      div.font-weight-bold You have to be registered in order to create entries
      <!--      div todo same as in pages/index, so make it a small component...-->
      v-row(align="center")
        v-col(sm="4" offset="1")
          v-btn.mt-4.mb-8(large to="/register" rounded outlined) Register
        v-col(sm="4")
          v-btn.mt-4.mb-8(large to="/login" rounded outlined) Login
    Search(
      :init_clear="false"
      :fixed_filters="domain_pre_filter",
      :mixin_domain_drafts="domain_name",
      :include_filters="filters")
</template>

<script>

  import EntryCreateList from "../../../components/EntryCreateList";
  import {global_context_filter} from "../../../lib/search";
  import Search from "../../../components/Search";
  import {USER_LOGGED_IN} from "../../../lib/store_consts";
  import {entrytype_filter_options} from "../../../lib/filter_option_consts";

  import {mapGetters} from "vuex"
  import {DOMAIN, DOMAIN_BY_NAME, SET_DOMAIN} from "../../../store";
  import {ENTRYTYPES_OF_DOMAIN} from "../../../store/entrytypes";

  export default {
    name: "index",
    components: {EntryCreateList, Search},
    created() {
      if (this.domain_data.name !== this.$store.getters[DOMAIN]) {
        this.$store.commit(SET_DOMAIN, this.domain_data)
      }
    },
    computed: {
      ...mapGetters({logged_in:USER_LOGGED_IN}),
      domain_name() {
        return this.$route.params.domain
      },
      entrytypes_entries() {
        return global_context_filter(this.$store.getters[ENTRYTYPES_OF_DOMAIN](this.domain_name))
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
