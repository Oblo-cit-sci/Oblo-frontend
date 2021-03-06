<template lang="pug">
  v-container(fluid)
    v-expansion-panels(v-model="search_panel_state")
      v-expansion-panel
        v-expansion-panel-header.px-3.py-1(color="#d6e5f0")
          v-icon mdi-magnify
          span {{$t('comp.search.search_filter')}}
        v-expansion-panel-content.px-3.py-1.no-wrap(:style="{'background-image':'linear-gradient(rgb(214, 229, 240), white)'}")
          v-row(wrap justify-start)
            v-col.py-0(cols="12")
              v-text-field.pt-0(
                v-model="keyword"
                :label="$t('comp.search.txt_field_label')"
                single-line
                solo
                :hint="search_hint"
                append-icon="mdi-magnify"
                @keydown="search_keypress($event)"
                @click:append="get_entries"
                clearable
                :loading="searching ? 'success' : false")
          v-row(v-if="show_filter")
            v-col.py-0(cols="12")
              Filterlist(
                :filter_options="filterlist_options"
                v-model="act_config"
                :filter_changed="filter_changed"
                @search="get_entries")
          v-row(v-if="has_prominent_filters")
            v-col.py-0(cols="12" v-for="filter in prominent_filters" :key="filter.name")
              Aspect(:aspect="filter.aspect" mode="edit" :ext_value.sync="prominent_filter_values[filter.name]")
    v-row.mt-3(v-if="prepend_search")
      v-col.py-0(offset="5" cols=2)
        v-progress-circular(indeterminate center size="35" color="success")
    EntryPreviewList(v-if="show_results && !prepend_search"
      :entries_uuids="filtered_entries_uuids"
      :requesting_entries="searching"
      :total_count="total_count"
      :preview_options="preview_options_search"
      :download_config="entries_download_config"
      @preview_action="$emit('preview_action',$event)"
      @request_more="request_more")
</template>

<script>

import {mapGetters, mapMutations} from "vuex"
import EntryPreviewList from "../entry/EntryPreviewList"
import FilterMixin from "../FilterMixin";
import NavBaseMixin from "../NavBaseMixin";
import PersistentStorageMixin from "../util/PersistentStorageMixin";
import {recursive_unpack2, route_change_query} from "~/lib/util";
import Filterlist from "~/components/util/Filterlist"
import {LANGUAGE, QP_D, QP_SEARCH, TEMPLATE} from "~/lib/consts"
import EntrySearchMixin from "~/components/EntrySearchMixin"
import Aspect from "~/components/Aspect"
import {aspect_default_value, pack_value, unpack} from "~/lib/aspect"
import {BUS_TRIGGER_SEARCH} from "~/plugins/bus";
import EntryFetchMixin from "~/components/entry/EntryFetchMixin"

const LOG = false

const relevant_query_keys = [QP_D, QP_SEARCH]

export default {
  name: "Search",
  components: {Aspect, Filterlist, EntryPreviewList},
  mixins: [FilterMixin, NavBaseMixin, PersistentStorageMixin, EntrySearchMixin, EntryFetchMixin],
  props: {
    init_clear: Boolean,
    init_full: Boolean,
    show_filter: {
      type: Boolean,
      default: true
    },
    show_results: {
      type: Boolean,
      default: true
    },
    preview_options: {
      type: Object
    },
    domain_data: { // to set default search templates
      type: Object
    },
    // filter all entries before
    // still used?
    search_config: {
      type: Array,
      default: () => []
    },
    include_filters: {
      type: Array,
      default: () => []
    },
    prominent_filters: Array
  },
  data() {
    const prominent_filter_values = this.get_prominent_filter_values_map()
    //
    return {
      search_panel_state: null,
      filter_values: {},
      keyword: '',
      kw_char_thresh: 4,
      prepend_search: false,
      filter_data: [],
      filter_changed: false,
      prominent_filter_values: prominent_filter_values
    }
  },
  created() {
    // console.log("search created")
    const last_route = this.$store.getters["search/get_route"]
    // console.log(last_route)
    if (this.$route.query.search) {
      this.keyword = this.$route.query.search
    }
    const this_route_data = this.act_relevant_route_data()
    // console.log(this_route_data, this.$_.isEqual(last_route, this_route_data))
    if (!this.$_.isEqual(last_route, this_route_data)) {
      // console.log("new to page. getting entries")
      this.clear()
      this.$store.commit("search/set_route", this_route_data)
      // the default changes triggering config change will trigger a search
      const language = this.$store.getters["user/settings"].domain_language
      const search_config_update = []
      if (this.domain_data) {
        const generated = this.get_filter_config(TEMPLATE, this.$_.get(this.domain_data, "search.default_templates", []), language)
        search_config_update.push(generated)
      }
      if (!this.act_config_by_name(LANGUAGE)) {
        search_config_update.push(this.get_filter_config(LANGUAGE, this.get_language_options([language])))
      }
      if (this.$_.isEmpty(search_config_update)) {
        // todo maybe that should set before_last: true?
        this.get_entries(false, false)
      } else {
        this.$store.commit("search/replace_in_act_config", search_config_update)
      }
    } else {
      // if uuids are selected, no search/update required.
      if (!this.select_uuids_config()) {
        // console.log("prepend. getting entries")
        this.prepend_search = true
        this.get_entries(true, false)
      }
    }

    this.$bus.$on(BUS_TRIGGER_SEARCH, (before_last = true, debounce = false) => {
      this.get_entries(before_last, debounce)
    })
  },
  beforeDestroy() {
    // TODO WHY IS THIS REQUIRED. or why is bus listener added anytime we have this comp. created. so it would trigger many times...
    this.$bus.$off(BUS_TRIGGER_SEARCH)
  },
  watch: {
    keyword: function (kw) {
      // !kw covers: kw === null || kw === "", which can both occur, (clear and deleting all manually)
      if (!kw) {
        // TODO
        // this uses now, the domain only filter.
        // could later be replaced by, last search or all local in that domain (like it is now)
        this.$router.push(route_change_query(this.$route, {}, false, ["search"]))
        // console.log("kw gone. get entries")
        this.get_entries()
      } else if (kw.length >= this.kw_char_thresh) {
        this.$router.push(route_change_query(this.$route, {"search": kw}))
        // console.log("kw get entries")
        this.get_entries()
      }
    },
    searching(is_searching) {
      if (!is_searching) {
        this.$emit("received_search_results", this.entries())
        this.prepend_search = false
        this.$emit("all_received_uuids", this.all_uuids())

        if (this.$store.getters["search/postponed_search"]()) {
          this.get_entries(false, false)
          this.$store.commit("search/postponed_search", false)
        }
      }
    },
    act_config(val, prev_val) {
      // console.log("currently searching", this.$store.state.search.searching)

      // console.log("config change", val, prev_val)
      // console.log("act_config", val) //, prev_val, this.$_.isEqual(val, prev_val))
      // todo special treatment here:
      // if the template changed kickout the tags
      const old_template_filter = val.find(f => f.name === "template")
      const new_template_filter = prev_val.find(f => f.name === "template")

      let update_config = false
      let new_config = this.$_.cloneDeep(val)

      // kickout tagfilter if template changed
      // only that one selected from the filterlist menu, not prominent filter, which will have another source_name
      if (old_template_filter && new_template_filter) { // old will be null initially, but there is nothing to kickout
        const template_filter_change = !this.$_.isEqual(unpack(old_template_filter.value), unpack((new_template_filter.value)))
        if (template_filter_change) {
          // kickout tag filter
          // console.log(val)
          const tag_filter = val.find(f => f.name === "tags" && this.$_.get(f, "source_name", "regular") === "regular")
          if (tag_filter) {
            // console.log("tag_filter", tag_filter)
            new_config = new_config.filter(f => f.name !== "tags")
            update_config = true
          }
        }
      }

      // check if a prominent filter changed: // inidicated by source_name (domain).
      // if yes we debounce, because there could be more clicked
      let prominent_filter_changed = false
      for (let changed_prominent_filter of new_config.filter(cf => this.$_.get(cf, "source_name", "regular") !== "regular")) {
        // console.log(changed_prominent_filter)
        const prev_filter = prev_val.find(cf => cf.name === changed_prominent_filter.name && cf.source_name === changed_prominent_filter.source_name)
        if (!this.$_.isEqual(unpack(changed_prominent_filter.value), unpack(this.$_.get(prev_filter, "value")))) {
          prominent_filter_changed = true
          break
        }
      }
      // const prominent_changed = this.new_config
      // this.$_.mapValues(prominent_filtersMap, a => aspect_default_value(a))

      const included_select_uuids = val.find(f => f.name === "select_uuids")
      const prev_included_select_uuids = prev_val.find(f => f.name === "select_uuids")
      // keep the last condition, otherwise, if you have 2 clusters, which are actually the same (article review: tanzania) it will to en endless loop
      // console.log(included_select_uuids && this.$_.isEqual(included_select_uuids,  prev_included_select_uuids))
      // console.log(!this.$_.isEqual(val, prev_val))
      if (included_select_uuids && this.$_.isEqual(included_select_uuids, prev_included_select_uuids) && !this.$_.isEqual(val, prev_val)) {
        // select_uuids didnt change that means we changed something else, and this selector has to go
        new_config = new_config.filter(f => f.name !== "select_uuids")
        update_config = true
      }
      if (update_config) {
        this.$store.commit("search/set_act_config", new_config)
      } else {
        // dont search if search is ongoing...
        if (this.$store.getters["search/get_searching"]()) {
          // console.log("searching atm. postponing...")
          this.$store.commit("search/postponed_search", true)
          return
        }

        // console.log("config change get entries")
        // if a prominent filter changed debounce
        this.get_entries(false, prominent_filter_changed)
      }
    },
    prominent_filter_values: {
      handler() {
        // console.log("values", values)
        for (let filter of this.prominent_filters) {
          // console.log(filter.name)
          // const val = this.prominent_filter_values[filter.name]
          // console.log(val)
          // console.log(filter)
          const value = unpack(this.prominent_filter_values[filter.name])
          if (!value || this.$_.isEmpty(value)) {
            this.$store.commit("search/remove_in_act_config", filter.search_config.name)
          } else {
            // TODO refactor
            this.$store.commit("search/replace_in_act_config", Object.assign({value}, filter.search_config))
          }
        }
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters({
      entries: "search/get_entries",
      get_searching: "search/get_searching",
      search_total_count: "search/get_search_count",
      all_uuids: "search/get_all_uuids",
    }),
    preview_options_search() {
      let options = this.$_.cloneDeep(this.preview_options)
      const lang_filter = this.act_config.find(f => f.name === LANGUAGE)
      if (lang_filter) {
        if (unpack(lang_filter.value).length > 1) {
          options.show_language_chip = true
        }
      }
      return options
    },
    act_config: {
      get: function () {
        // console.log("Search.get_act_config", this.$store.getters["search/get_act_config"])
        return this.$store.getters["search/get_act_config"]
      },
      set: function (val) {
        // console.log("Search.set_act_config", val)
        this.filter_changed = true
        this.$store.commit("search/set_act_config", val)
      }
    },
    has_prominent_filters() {
      // console.log(this.prominent_filters)
      return !this.$_.isEmpty(this.prominent_filters)
    },
    searching() {
      return this.get_searching()
    },
    search_hint() {
      if (this.keyword && this.keyword.length < this.kw_char_thresh) {
        return this.$t("comp.search.min_chars_rule")
      }
    },
    local_entries() {
      const all_filters = this.$_.concat(this.act_config, this.search_config)
      const has_local_filter = this.has_local_filter(all_filters)
      // console.log("has_local_filter", has_local_filter)
      if (has_local_filter) {
        return this.local_search(all_filters).reverse()
      } else {
        return []
      }
    },
    filtered_entries_uuids() {
      let result_entries_uuids = this.entries() // must be a call
      // console.log("allf", this.act_config, this.search_config)
      result_entries_uuids = this.local_entries.concat(result_entries_uuids)
      // console.log("local entries", this.local_entries)
      // console.log("new filtered entries", result_entries_uuids)
      if (LOG) {
        console.log("Search.filtered_entries. entries:", result_entries_uuids.length)
        console.log("e1:", result_entries_uuids)
      }
      // console.log(result_entries_uuids)
      return result_entries_uuids
    },
    filterlist_options() {
      return this.include_filters
    },
    total_count() {
      return this.search_total_count + this.local_entries.length
    },
    entries_download_config() {
      return {
        entries: this.all_uuids(),
        config: this.act_config
      }
    }
  },
  methods: {
    ...mapMutations({"clear": "search/clear"}),
    get_prominent_filter_values_map() {
      /**
       Just used for data, to restore existing values
       */
      const prominent_filtersMap = this.$_.keyBy(this.prominent_filters, "name")
      const act_config = this.$store.getters["search/get_act_config"]
      return this.$_.mapValues(prominent_filtersMap, filter => {
        const existing_search_config = act_config.find(
          f => f.name === filter.search_config.name &&
            f.source_name === filter.search_config.source_name)
        if (existing_search_config) {
          return pack_value(existing_search_config.value)
        } else {
          return aspect_default_value(filter.aspect)
        }
      })
    },
    search_keypress(keyEvent) {
      if (keyEvent.keyCode === 13) {
        this.$router.push(route_change_query(this.$route))
        this.get_entries(false, true)
      }
    },
    get_entries(before_last = false, debounce = true) {
      // console.log("get_entries", "before-last", before_last, "debounce", debounce)
      const select_uuids = this.select_uuids_config()
      if (select_uuids) {
        this.fetch_select_uuids(select_uuids)
      } else {
        let config = this.searchConfiguration(before_last)
        // console.log("Search.config", config)
        if (!before_last) {
          this.$store.commit("search/clear_entries")
          this.$store.commit("search/set_search_count", 0)
        }
        this.$store.commit("search/set_route", this.act_relevant_route_data())
        this.$store.commit("search/set_searching", true)

        // console.log("search with config", config)

        // const prepend = this.entries().length > 0
        if (debounce) {
          this.debounced_search(config)
        } else {
          this.search_entries(config)
        }
      }
      // TODO would be nice to have the debounced search work with a promise so we do not need the have done-flags in the store...
    },
    fetch_select_uuids(select_uuids) {
      // todo this whole part does not consider pagination... more than 40 entries.
      this.get_complete_missing_meta(select_uuids).then(result => {
        if (typeof result === "boolean") {
          this.$store.commit("search/set_entries", select_uuids)
          this.$store.commit("search/set_search_count", select_uuids.length)
        } else if (result.status === 200) {
          const entries = this.$_.get(result, "data.data.entries", [])
          this.store_received_entries(entries)
          const uuids = entries.map(e => e.uuid)
          this.$store.commit("search/set_entries", uuids)
          this.$store.commit("search/set_search_count", uuids.length)
        } else {
          console.log(result)
          this.error_snackbar("Couldn't fetch entries")
        }
        // console.log("toll", uuids)
        // // store_received_entries

      })
    },
    select_uuids_config() {
      // console.log(this.act_config)
      for (let filter of this.act_config) {
        if (filter.name === "select_uuids") {
          return filter.value
        }
      }
      return null
    },
    request_more() {
      // console.log("request more", )
      let config = this.searchConfiguration()
      this.$store.commit("search/set_searching", true)
      const offset = this.$store.getters["search/get_received_entries"]
      this.debounced_search(config, offset)
    },
    searchConfiguration(before_last = false) {
      let configuration = {
        required: [],
        include: []
      }
      for (let filter of this.search_config) {
        if (filter.source_name !== "local") { // dont add drafts filter
          configuration.required.push(filter)
        }
      }
      // todo because of this stuff, grabbing and merging filters (user-set values) and info from the config
      // e.g. "include_as" we cant plug in the. the filters dont have a uniform structure (FilterMxin, get_...FILTER)
      // console.log(this.act_config)
      for (let filter of this.act_config) {
        const filter_option = this.$_.find(this.filterlist_options, fo => fo.name === filter.name)
        // console.log(filter_option)
        // all configs must be contained in the options, maybe not the best method... uuids_select doesnt need to be there
        if (filter_option) {
          const config = filter_option.search_config
          if (config.hasOwnProperty("name")) {
            config.value = unpack(filter.value.map(item => item.value))
            configuration.required.push(config)
          } else if (config.hasOwnProperty("include_as")) {
            // console.log("include as", config)
            configuration.include.push({name: config.include_as, value: recursive_unpack2(filter.value)})
          } else {
            console.log("error cannot process filter-option", filter.name)
          }
        } else {
          console.log(filter, "not in options")
        }
      }
      if (before_last) {
        const ts = this.$store.getters["search/get_searchtime"]
        if (ts)
          configuration.required.push({name: "before_ts", value: ts})
      }
      if (this.keyword) {
        for (let default_search_part of ["title", "tags"]) {
          configuration.include.push({name: default_search_part, value: this.keyword, search_group: "query"})
        }
      }
      // console.log(configuration)
      return configuration
    },
    act_relevant_route_data() {
      return {
        path: this.$route.path,
        params: this.$_.pick(this.$route.query, relevant_query_keys)
      }
    },
    open_entries_download_dialog() {
      this.download_dialog_open = true
    }
  }
}
</script>

<style scoped>
</style>

