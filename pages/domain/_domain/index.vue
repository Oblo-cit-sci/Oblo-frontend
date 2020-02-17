<template lang="pug">
  v-container(fluid)
    div(class="header-domain")
      p.display-1 {{domain_data.page_index.title}}
      p.heading {{domain_data.page_index.description}}
    v-divider
    EntryCreateList(
      v-if="logged_in"
      :entrytypes_entries="entrytypes_entries")
    div.mt-2(v-else)
      div.font-weight-bold You have to be registered in order to create entries
      v-row(align="center")
        v-col(sm="4" offset="1")
          v-btn(large to="/register") Register
        v-col(sm="4")
          v-btn(large to="/login") Login
    Search(
      :init_clear="true"
      :view_mode.sync="entries_view"
      :fixed_filters="domain_pre_filter",
      :include_filters="filters")
</template>

<script>

  import EntryCreateList from "../../../components/EntryCreateList";
  import {global_context_filter} from "../../../lib/search";
  import Search from "../../../components/Search";
  import {ENTRYTYPES_OF_DOMAIN, DOMAIN, DOMAIN_BY_NAME, SET_DOMAIN, USER_LOGGED_IN} from "../../../lib/store_consts";
  import {entrytype_filter_options} from "../../../lib/filter_option_consts";
  import {VIEW_SEARCH} from "../../../lib/consts";

  import {mapGetters} from "vuex"

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
      entries_view: {
        get: function () {
          return this.$route.query.view || VIEW_SEARCH
        },
        set: function (view) {
          let route = {
            path: this.$route.path,
            query: {
              view: view,
            }
          }
          this.$router.push(route)
        }
      },
      entrytypes_entries() {
        return global_context_filter(this.$store.getters[ENTRYTYPES_OF_DOMAIN](this.$route.params.domain))
      },
      domain_data() {
        return this.$store.getters[DOMAIN_BY_NAME](this.$route.params.domain)
      },
      filters() {
        return [entrytype_filter_options]
      },
      domain_pre_filter() {
        return [{
          name: "meta_aspect",
          meta_aspect_name: DOMAIN,
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
