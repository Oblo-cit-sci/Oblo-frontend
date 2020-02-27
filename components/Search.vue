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
      v-row(v-if="waiting")
        v-col(offset="5" cols=2)
          v-progress-circular(indeterminate center size="35" color="success")
      EntryPreviewList(v-if="show_results"
        :entries="filtered_entries"
        :preview_options="preview_options"
        @preview_action="$emit('preview_action',$event)")
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
  import {fetch_domain_entries, search_entries} from "../lib/client"
  import {
    CLEAR_SEARCH,
    ENTRIES_ALL_ENTRIES_ARRAY,
    ENTRIES_HAS_ENTRY,
    ENTRYTYPES_TYPES,
    SEARCH_GET_ENTRIES,
    SEARCH_SET_ENTRIES
  } from "../lib/store_consts"
  import FilterSelect from "./FilterSelect";
  import {pack_value} from "../lib/aspect";
  import FilterMixin from "./FilterMixin";
  import {filter_required} from "../lib/search";
  import {entries2vuetify_tree} from "../lib/entry_collections";
  import NavBaseMixin from "./NavBaseMixin";
  import {REGULAR, VIEW_SEARCH, VIEW_TREE} from "../lib/consts";

  const LOG = false

  export default {
    name: "Search",
    components: {FilterSelect, EntryPreviewList},
    mixins: [FilterMixin, NavBaseMixin],
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
    },
    data() {
      return {
        // view_mode: "search",
        //
        filter_configs: this.$_.mapKeys(this.include_filters, v => v.name),
        filter_values: {},
        //
        searching: false,
        keyword: '',
        kw_char_thresh: 4,
        VIEW_SEARCH: VIEW_SEARCH,
        VIEW_TREE: VIEW_TREE
      }
    },
    created() {
      if (this.init_clear) {
        this.clear()
      }
      if (this.init_full) {
        const required = this.searchConfiguration().required
        const all_entries = this.$store.getters[ENTRIES_ALL_ENTRIES_ARRAY]()
        const filtered_entries = filter_required(all_entries, required).map(e => ([e.uuid, e]))
        // const entries = filter_required(this.$store.getters[ENTRIES_ALL_ENTRIES_ARRAY](), required).map(e => ([e.uuid, e]))
        // console.log("init_full, entries:", filtered_entries.length)
        this.$store.commit(SEARCH_SET_ENTRIES, filtered_entries)
        this.$emit("received_search_results", filtered_entries.map(e => e[1]))
      } else if (this.entries.length === 0) {
        console.log("search create getting entries")
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
          this.getEntries()
        } else if (kw.length >= this.kw_char_thresh) {
          this.$_.debounce(this.getEntries, 500)()
        }
      },
      view_mode(val) {
        this.$emit("update:view_mode", val)
      }
    },
    computed: {
      ...mapGetters({entries: SEARCH_GET_ENTRIES}),
      tree() {
        return entries2vuetify_tree(this.entries(), this.$store.getters[ENTRYTYPES_TYPES], true)
      },
      search_hint() {
        if (this.keyword && this.keyword.length < this.kw_char_thresh) {
          return "type 4 characters to trigger search"
        }
      },
      waiting() {
        return this.entries().length === 0
      },
      filtered_entries() {
        let result_entries = this.entries() // must be a call
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
        return result_entries
      }
    },
    methods: {
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
      getEntries() {
        // console.log("search getting entries")
        this.searching = true
        let config = this.searchConfiguration()
        // build_config merges 2 objects,
        //console.log("search.getEntries: config", config)
        search_entries(this.$api, this.$store, config)
          .then(res => {
            this.searching = false
            this.$emit("received_search_results", this.entries)
          }).catch(err => {
          console.log('Error getting entries')
          this.searching = false
        })
      },
      ...mapMutations({"clear": CLEAR_SEARCH}),
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

