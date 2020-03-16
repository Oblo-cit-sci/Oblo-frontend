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
          @click:append-outer="getEntries"
          clearable
          :loading="searching")
    v-row
      v-col.col-md-6.col-xs-12(v-for="(config, index) in Object.values(filter_configs)" cols="12"  :key="index")
        FilterSelect(v-bind="config" :selection.sync="filter_values[config.name]")
    v-row(v-if="prepend_search")
      v-col(offset="5" cols=2)
        v-progress-circular(indeterminate center size="35" color="success")
    EntryPreviewList(v-if="show_results"
      :entries="filtered_entries"
      :requesting_entries="searching"
      :total_count="total_count"
      :preview_options="preview_options"
      @preview_action="$emit('preview_action',$event)"
      @request_more="request_more")
</template>

<script>

  import {mapGetters, mapMutations} from "vuex"
  import EntryPreviewList from "../components/EntryPreviewList"
  import {debounced_search} from "../lib/client"
  import FilterSelect from "./FilterSelect";
  import FilterMixin from "./FilterMixin";
  import NavBaseMixin from "./NavBaseMixin";
  import {
    SEARCH_CLEAR,
    SEARCH_GET_ENTRIES,
    SEARCH_GET_PATH, SEARCH_GET_SEARCH_COUNT, SEARCH_GET_SEARCHING, SEARCH_GET_SEARCHTIME,
    SEARCH_RECEIVED_ENTRIES,
    SEARCH_SET_PATH, SEARCH_SET_SEARCHING
  } from "../store/search";
  import PersistentStorageMixin from "./PersistentStorageMixin";

  const LOG = false

  export default {
    name: "Search",
    components: {FilterSelect, EntryPreviewList},
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
      fixed_filters: {
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
        // view_mode: "search",
        //
        filter_configs: this.$_.mapKeys(this.include_filters, v => v.name),
        filter_values: {},

        keyword: '',
        kw_char_thresh: 4,

        prepend_search: false
      }
    },
    created() {
      console.log("search created!")
      // console.log(this.init_clear, this.init_full, this.searching, this.entries().length)
      let start_search = false
      const last_path = this.$store.getters[SEARCH_GET_PATH]
      if(last_path !== this.$route.path) {
        this.clear()
        this.$store.commit(SEARCH_SET_PATH, this.$route.path)
        start_search = true
        this.getEntries()
      } else {
        this.prepend_search= true
        this.getEntries(true)
      }

      if (this.init_clear) {
        this.clear()
        start_search = true
      }

      if(start_search) {
        this.getEntries()
      }

      // if (this.init_full) {
      //   const required = this.searchConfiguration().required
      //   const all_entries = this.$store.getters[ENTRIES_ALL_ENTRIES_ARRAY]()
      //   const filtered_entries = filter_required(all_entries, required).map(e => ([e.uuid, e]))
      //   // const entries = filter_required(this.$store.getters[ENTRIES_ALL_ENTRIES_ARRAY](), required).map(e => ([e.uuid, e]))
      //   // console.log("init_full, entries:", filtered_entries.length)
      //   this.$store.commit(SEARCH_SET_ENTRIES, filtered_entries)
      //   this.$emit("received_search_results", filtered_entries.map(e => e[1]))
      // } else if (this.entries().length === 0) {
      //   // console.log("search create getting entries")
      //   this.getEntries()
      // } else {
      //   this.getEntries(true)
      // }
    },
    watch: {
      keyword: function (kw) {
        // !kw covers: kw === null || kw === "", which can both occur, (clear and deleting all manually)
        if (!kw) {
          // TODO
          // this uses now, the domain only filter.
          // could later be replaced by, last search or all local in that domain (like it is now)
          this.getEntries()
        } else if (kw.length >= this.kw_char_thresh) {
          this.getEntries()
        }
      },
      view_mode(val) {
        this.$emit("update:view_mode", val)
      },
    },
    computed: {
      ...mapGetters({entries: SEARCH_GET_ENTRIES, get_searching: SEARCH_GET_SEARCHING, total_count: SEARCH_GET_SEARCH_COUNT}),
      searching() {
        const is_searching = this.get_searching()
        if(is_searching === false) {
          this.$emit("received_search_results", this.entries())
          this.prepend_search = false
        }
        return is_searching
      },
      search_hint() {
        if (this.keyword && this.keyword.length < this.kw_char_thresh) {
          return "type 4 characters to trigger search"
        }
      },
      filtered_entries() {
        // console.log("EE--->")
        let result_entries = this.entries() // must be a call
        if(this.mixin_domain_drafts) {
          const drafts = this.$store.getters["entries/domain_drafts_uuids"](this.mixin_domain_drafts).reverse()
          result_entries = drafts.concat(result_entries)
        }
        // console.log("new filtered entries", result_entries)
        if (LOG) {
          console.log("Search.filtered_entries. entries:", result_entries.length)
          console.log("e1:", result_entries)
        }
        this.persist_entries()
        return result_entries
      }
    },
    methods: {
      getEntries(before_last= false) {
        // this.searching = true
        // console.log("getting entries")
        let config = this.searchConfiguration(before_last)
        // if(before_last) {
        //   if (this.entries().length > 0) {
        //     // const before_ts = this.$store.getters[]
        //     config.required.push({name: "before_ts", ts: before_ts})
        //   }
        // }
        // build_config merges 2 objects,
        this.$store.commit(SEARCH_SET_SEARCHING, true)
        // const prepend = this.entries().length > 0
        debounced_search(this.$api, this.$store, config)
        // TODO would be nice to have the debounced search work with a promise so we do not need the
      },
      request_more() {
        // console.log("request more", )
        let config = this.searchConfiguration()
        this.$store.commit("search/set_searching", true)
        const offset = this.$store.getters[SEARCH_RECEIVED_ENTRIES]
        debounced_search(this.$api, this.$store, config, offset)
      },
      ...mapMutations({"clear": SEARCH_CLEAR}),
      searchConfiguration(before_last = false) {
        let configuration = {
          required: [],
          include: {}
        }
        for (let filter of this.fixed_filters) {
          configuration.required.push(filter)
        }

        if(before_last) {
          const ts = this.$store.getters[SEARCH_GET_SEARCHTIME]
          console.log(ts)
          configuration.required.push({name: "before_ts", ts: ts})
        }
        if (this.keyword) {
          for (let default_search_part of ["title", "tags", "aspect_search"]) {
            configuration.include[default_search_part] = this.keyword
          }
        }
        return configuration
      }
    },

  }
</script>

<style scoped>
</style>

