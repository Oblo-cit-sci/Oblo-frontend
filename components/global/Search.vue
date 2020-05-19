<template lang="pug">
  v-container(fluid)
    v-row(wrap justify-start)
      v-col(cols="12")
        v-text-field(
          v-model="keyword"
          label="Search"
          single-line
          :hint="search_hint"
          append-outer-icon="mdi-magnify"
          @keydown="search_keypress($event)"
          @click:append-outer="getEntries"
          clearable
          :loading="searching ? 'success' : false")
    v-row
      v-col(cols="12")
        Filterlist(
          :filter_options="filterlist_options"
          v-model="filter_data"
          :search_button="filter_search_button"
          @search="getEntries")
    v-row(v-if="prepend_search")
      v-col(offset="5" cols=2)
        v-progress-circular(indeterminate center size="35" color="success")
    EntryPreviewList(v-if="show_results && !prepend_search"
      :entries="filtered_entries"
      :requesting_entries="searching"
      :total_count="total_count"
      :preview_options="preview_options"
      @preview_action="$emit('preview_action',$event)"
      @request_more="request_more")
</template>

<script>

  import {mapGetters, mapMutations} from "vuex"
  import EntryPreviewList from "../entry/EntryPreviewList"
  import {debounced_search} from "~/lib/client"
  import FilterSelect from "../FilterSelect";
  import FilterMixin from "../FilterMixin";
  import NavBaseMixin from "../NavBaseMixin";
  import {
    SEARCH_CLEAR, SEARCH_GET_ALL_UUIDS,
    SEARCH_GET_ENTRIES,
    SEARCH_GET_ROUTE,
    SEARCH_GET_SEARCH_COUNT,
    SEARCH_GET_SEARCHING,
    SEARCH_GET_SEARCHTIME,
    SEARCH_RECEIVED_ENTRIES,
    SEARCH_SET_ROUTE,
    SEARCH_SET_SEARCHING
  } from "~/store/search";
  import PersistentStorageMixin from "../util/PersistentStorageMixin";
  import {ENTRIES_DOMAIN_DRAFTS_UUIDS} from "~/store/entries";
  import {route_change_query} from "~/lib/util";
  import Filterlist from "~/components/util/Filterlist"
  import {privacy_filter_options} from "~/lib/filter_option_consts"
  import {QP_D, QP_SEARCH} from "~/lib/consts"

  const LOG = false

  const relevant_query_keys = [QP_D, QP_SEARCH]

  export default {
    name: "Search",
    components: {Filterlist, FilterSelect, EntryPreviewList},
    mixins: [FilterMixin, NavBaseMixin, PersistentStorageMixin],
    props: {
      init_clear: Boolean,
      init_full: Boolean,
      show_results: {
        type: Boolean,
        default: true
      },
      preview_options: {
        type: Object
      },
      // filter all entries before
      search_config: {
        type: Array,
        default: () => []
      },
      include_filters: {
        type: Array,
        default: () => []
      },
      mixin_domain_drafts: {
        type: String
      }
    },
    data() {
      return {
        filter_values: {},
        keyword: '',
        kw_char_thresh: 4,
        prepend_search: false,
        filter_data: [],
        filter_changed: false
      }
    },
    created() {
      let start_search = false
      // debugger
      const last_route = this.$store.getters[SEARCH_GET_ROUTE]
      if (this.$route.query.search) {
        this.keyword = this.$route.query.search
      }
      const this_route_data = this.act_relevant_route_data()
      if (!this.$_.isEqual(last_route, this_route_data)) {
        this.prepend_search = true
        this.clear()
        this.$store.commit(SEARCH_SET_ROUTE, this_route_data)
        start_search = true
        this.getEntries()
      } else {
        this.prepend_search = true
        this.getEntries(true)
      }
      if (this.init_clear) {
        this.clear()
        start_search = true
      }
      if (start_search) {
        this.getEntries()
      }
    },
    watch: {
      keyword: function (kw) {
        // !kw covers: kw === null || kw === "", which can both occur, (clear and deleting all manually)
        if (!kw) {
          // TODO
          // this uses now, the domain only filter.
          // could later be replaced by, last search or all local in that domain (like it is now)
          this.$router.push(route_change_query(this.$route, {}, false, ["search"]))
          this.getEntries()
        } else if (kw.length >= this.kw_char_thresh) {
          this.$router.push(route_change_query(this.$route, {"search": kw}))
          this.getEntries()
        }
      },
      view_mode(val) {
        this.$emit("update:view_mode", val)
      },
      filter_data() {
        this.filter_changed = true
      }
    },
    computed: {
      ...mapGetters({
        entries: SEARCH_GET_ENTRIES,
        get_searching: SEARCH_GET_SEARCHING,
        total_count: SEARCH_GET_SEARCH_COUNT,
        all_uuids: SEARCH_GET_ALL_UUIDS,
      }),
      is_pure() {
        // no search query nor filter
        const no_params = this.$_.isEmpty(this.$_.pick(this.$route.query, [QP_SEARCH]))
        const no_filter = this.filter_data.length === 0
        return no_params && no_filter
      },
      searching() {
        const is_searching = this.get_searching()
        if (is_searching === false) {
          this.$emit("received_search_results", this.entries())
          this.prepend_search = false
          this.$emit("all_received_uuids", this.all_uuids())
        }
        return is_searching
      },
      search_hint() {
        if (this.keyword && this.keyword.length < this.kw_char_thresh) {
          return "type 4 characters to trigger search"
        }
      },
      filter_search_button() {
        return {
          color: this.filter_changed ? "success" : null
        }
      },
      filtered_entries() {
        let result_entries = this.entries() // must be a call
        // todo this should just check if QP_D is set and make the filter manual
        // so that drafts are also shown on the profile
        if (this.mixin_domain_drafts && this.is_pure) {
          const drafts = this.$store.getters[ENTRIES_DOMAIN_DRAFTS_UUIDS](this.mixin_domain_drafts).reverse()
          result_entries = drafts.concat(result_entries)
        }
        // console.log("new filtered entries", result_entries)
        if (LOG) {
          console.log("Search.filtered_entries. entries:", result_entries.length)
          console.log("e1:", result_entries)
        }
        this.persist_entries()
        return result_entries
      },
      filterlist_options() {
        const filter = this.include_filters
        if (!this.$store.getters.is_visitor) {
          filter.push(privacy_filter_options)
        }
        return this.$_.concat(filter)
      }
    },
    methods: {
      search_keypress(keyEvent) {
        if (keyEvent.keyCode === 13) {
          this.$router.push(route_change_query(this.$route))
          this.getEntries()
        }
      },
      getEntries(before_last = false) {
        let config = this.searchConfiguration(before_last)
        this.$store.commit(SEARCH_SET_ROUTE, this.act_relevant_route_data())
        this.$store.commit(SEARCH_SET_SEARCHING, true)
        // const prepend = this.entries().length > 0
        debounced_search(this.$api, this.$store, config)
        // TODO would be nice to have the debounced search work with a promise so we do not need the
      },
      request_more() {
        // console.log("request more", )
        let config = this.searchConfiguration()
        this.$store.commit(SEARCH_SET_SEARCHING, true)
        const offset = this.$store.getters[SEARCH_RECEIVED_ENTRIES]
        debounced_search(this.$api, this.$store, config, offset)
      },
      ...mapMutations({"clear": SEARCH_CLEAR}),
      searchConfiguration(before_last = false) {
        let configuration = {
          required: [],
          include: {}
        }
        for (let filter of this.search_config) {
          configuration.required.push(filter)
        }
        const filterlist_options = this.filterlist_options
        for (let filter of this.filter_data) {
          const config = filterlist_options.find(fo => fo.name === filter.name).search_config
          if (config.hasOwnProperty("name")) {
            config.conditional_value = filter.value
            configuration.required.push(config)
          } else if(config.hasOwnProperty("include_as")) {
            configuration.include[config.include_as] = filter.value
          } else {
            console.log("error cannot proccess filter-option", filter.name)
          }
        }
        if (before_last) {
          const ts = this.$store.getters[SEARCH_GET_SEARCHTIME]
          configuration.required.push({name: "before_ts", ts: ts})
        }
        if (this.keyword) {
          for (let default_search_part of ["title", "tags", "aspect_search"]) {
            configuration.include[default_search_part] = this.keyword
          }
        }
        return configuration
      },
      act_relevant_route_data() {
        return {
          path: this.$route.path,
          params: this.$_.pick(this.$route.query, relevant_query_keys)
        }
      }
    }
  }
</script>

<style scoped>
</style>

