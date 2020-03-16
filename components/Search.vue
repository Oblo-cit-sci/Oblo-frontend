<template lang="pug">
  v-container(fluid)
    <!--    v-row(note="temporarily out.... doesnt make sense for the public version")-->
    <!--    v-row-->
    <!--      v-col-->
    <!--        v-btn-toggle(:value="view_mode" @change="$emit('update:view_mode', to_view($event))" mandatory)-->
    <!--          v-btn(:value="VIEW_SEARCH") search-->
    <!--          v-btn(:value="VIEW_TREE") tree view-->
    div(v-if="view_mode===VIEW_SEARCH")
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
      EntryPreviewList(v-if="show_results"
        :entries="filtered_entries"
        :requesting_entries="searching"
        :total_count="total_count"
        :preview_options="preview_options"
        @preview_action="$emit('preview_action',$event)"
        @request_more="request_more")
    v-row(v-if="view_mode===VIEW_TREE" wrap)
      v-col
        v-treeview(:items="tree" open-on-click)
          template(v-slot:prepend="{ item }")
            v-icon {{item.icon}}
            v-icon(v-if="item.outdated" color="orange") mdi-alert-outline
          template(v-slot:append="{ item }")
            v-icon(@click="to_entry(item.uuid)") mdi-arrow-right
</template>

<script>

  import {mapGetters, mapMutations} from "vuex"
  import EntryPreviewList from "../components/EntryPreviewList"
  import {debounced_search,  search_entries} from "../lib/client"
  import {
    ENTRYTYPES_TYPES
  } from "../lib/store_consts"
  import FilterSelect from "./FilterSelect";
  import FilterMixin from "./FilterMixin";
  import {filter_required} from "../lib/search";
  import {entries2vuetify_tree} from "../lib/entry_collections";
  import NavBaseMixin from "./NavBaseMixin";
  import {VIEW_SEARCH, VIEW_TREE} from "../lib/consts";
  import {
    CLEAR_SEARCH, SEARCH_CLEAR,
    SEARCH_GET_ENTRIES,
    SEARCH_GET_PATH, SEARCH_GET_SEARCH_COUNT, SEARCH_GET_SEARCHING,
    SEARCH_RECEIVED_ENTRIES,
    SEARCH_SET_ENTRIES, SEARCH_SET_PATH, SEARCH_SET_SEARCHING
  } from "../store/search";
  import {ENTRIES_ALL_ENTRIES_ARRAY, ENTRIES_DOMAIN} from "../store/entries";
  import PersistentStorageMixin from "./PersistentStorageMixin";

  const LOG = false

  export default {
    name: "Search",
    components: {FilterSelect, EntryPreviewList},
    mixins: [FilterMixin, NavBaseMixin, PersistentStorageMixin],
    props: {
      init_clear: Boolean,
      init_full: Boolean,
      view_mode: {
        type: String,
        default: VIEW_SEARCH
      },
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
        VIEW_SEARCH: VIEW_SEARCH,
        VIEW_TREE: VIEW_TREE
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
      }
      else if (this.init_clear) {
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
        }
        return is_searching
      },
      tree() {
        return entries2vuetify_tree(this.entries(), this.$store.getters[ENTRYTYPES_TYPES], true)
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
          const drafts = this.$store.getters["entries/domain_drafts_uuids"](this.mixin_domain_drafts)
          result_entries = drafts.concat(result_entries)
        }
        // console.log("new filtered entries", result_entries)
        if (LOG) {
          console.log("Search.filtered_entries. entries:", result_entries.length)
          console.log("e1:", result_entries)
        }
        // result_entries = result_entries.filter(e => this.$store.getters[ENTRIES_HAS_ENTRY](e.uuid))
        // for (let filter of Object.values(this.filter_configs)) {
        //   //todo we select the value, because select is not just emitting value up, clean this!
        //   const filter_value = (this.filter_values[filter.name] || pack_value(null)).value
        //   if (filter_value) {
        //     result_entries = this[filter.filter_method](result_entries, filter_value)
        //   }
        // }
        this.persist_entries()
        return result_entries
      }
    },
    methods: {
      // debounced_search: this.$_.debounce(this.getEntries, 1000),
      // todo test later. this was due to a bug in vuetify, buttons would only send their index, not their value
      to_view(view_selected) {
        const is_index = parseInt(view_selected)
        if (isNaN(is_index)) {
          return view_selected
        } else {
          if (is_index === 0)
            return VIEW_SEARCH
          else
            return VIEW_TREE
        }
      },
      getEntries(before_last= true) {
        // this.searching = true
        // console.log("getting entries")
        let config = this.searchConfiguration()
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
      searchConfiguration() {
        // domain = this.$store.state.domain.value
        let configuration = {
          required: [],
          include: {}
        }
        for (let filter of this.fixed_filters) {
          configuration.required.push(filter)
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

