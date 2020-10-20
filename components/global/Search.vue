<template lang="pug">
  v-container(fluid)
    v-expansion-panels(v-model="search_panel_state")
      v-expansion-panel
        v-expansion-panel-header.px-3.py-1(color="#d6e5f0") {{$t('comp.search.search_filter')}}
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
              Aspect(:aspect="filter" mode="edit" :ext_value.sync="promoninent_filter_values[filter.name]")
    v-row(v-if="prepend_search")
      v-col.py-0(offset="5" cols=2)
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
import {debounced_search, search_entries} from "~/lib/client"
import FilterMixin from "../FilterMixin";
import NavBaseMixin from "../NavBaseMixin";
import {
  SEARCH_GET_ALL_UUIDS,
  SEARCH_GET_ENTRIES,
  SEARCH_GET_ROUTE,
  SEARCH_GET_SEARCH_COUNT,
  SEARCH_GET_SEARCHING,
  SEARCH_GET_SEARCHTIME,
  SEARCH_RECEIVED_ENTRIES, SEARCH_SET_ENTRIES,
  SEARCH_SET_ROUTE, SEARCH_SET_SEARCH_COUNT,
  SEARCH_SET_SEARCHING
} from "~/store/search";
import PersistentStorageMixin from "../util/PersistentStorageMixin";
import {route_change_query} from "~/lib/util";
import Filterlist from "~/components/util/Filterlist"
import {QP_D, QP_SEARCH} from "~/lib/consts"
import EntrySearchMixin from "~/components/EntrySearchMixin"
import Aspect from "~/components/Aspect"
import {aspect_default_value, unpack} from "~/lib/aspect"

const LOG = false

const relevant_query_keys = [QP_D, QP_SEARCH]

export default {
  name: "Search",
  components: {Aspect, Filterlist, EntryPreviewList},
  mixins: [FilterMixin, NavBaseMixin, PersistentStorageMixin, EntrySearchMixin],
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
    mixin_domain_drafts: {
      type: String
    },
    prominent_filters: Array
  },
  data() {
    const prominent_filtersMap = this.$_.keyBy(this.prominent_filters, "name")
    return {
      search_panel_state: null,
      filter_values: {},
      keyword: '',
      kw_char_thresh: 4,
      prepend_search: false,
      filter_data: [],
      filter_changed: false,
      promoninent_filter_values: this.$_.mapValues(prominent_filtersMap, a => aspect_default_value(a))
    }
  },
  created() {
    // console.log("search created")
    let start_search = false
    const last_route = this.$store.getters[SEARCH_GET_ROUTE]
    // console.log(last_route)
    if (this.$route.query.search) {
      this.keyword = this.$route.query.search
    }
    const this_route_data = this.act_relevant_route_data()
    // console.log(this_route_data, this.$_.isEqual(last_route, this_route_data))
    if (!this.$_.isEqual(last_route, this_route_data)) {
      // console.log("no clearing")
      this.clear()
      this.$store.commit(SEARCH_SET_ROUTE, this_route_data)
      this.get_entries(false, false)
    } else {
      // if uuids are selected, no search/update required.
      if(!this.select_uuids_config()) {
        // console.log("prepend")
        this.prepend_search = true
        this.get_entries(true, false)
      }
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
        this.get_entries()
      } else if (kw.length >= this.kw_char_thresh) {
        this.$router.push(route_change_query(this.$route, {"search": kw}))
        this.get_entries()
      }
    },
    view_mode(val) {
      this.$emit("update:view_mode", val)
    },
    searching(is_searching) {
      if (!is_searching) {
        this.$emit("received_search_results", this.entries())
        this.prepend_search = false
        this.$emit("all_received_uuids", this.all_uuids())
      }
    },
    act_config(val, prev_val) {
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
        const template_filter_change = !this.$_.isEqual(old_template_filter.value, new_template_filter.value)
        if (template_filter_change) {
          // kickout tag filter
          // console.log(val)
          const tag_filter = val.find(f => f.name === "tags" && this.$_.get(f, "source_name","regular") === "regular")
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
      for(let changed_prominent_filter of new_config.filter(cf => this.$_.get(cf, "source_name", "regular") !== "regular")) {
        console.log(changed_prominent_filter)
        const prev_filter = prev_val.find(cf => cf.name === changed_prominent_filter.name && cf.source_name === changed_prominent_filter.source_name)
        if (!this.$_.isEqual(changed_prominent_filter.value, this.$_.get(prev_filter,"value"))) {
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
        // if a prominent filter changed debounce
        this.get_entries(false, prominent_filter_changed)
      }
    },
    promoninent_filter_values: {
      handler() {
        // console.log("values", values)
        for (let filter of this.prominent_filters) {
          // console.log(filter.name)
          const val = this.promoninent_filter_values[filter.name]
          // console.log(val)
          // console.log(filter)
          const value = unpack(this.promoninent_filter_values[filter.name])
          if(!value || this.$_.isEmpty(value)) {
            this.$store.commit("search/remove_in_act_config", filter.search_config.name)
          } else {
            this.$store.commit("search/replace_in_act_config", Object.assign({value}, filter.search_config))
          }
        }
      },
      deep: true
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
    filtered_entries() {
      let result_entries = this.entries() // must be a call
      const hide_drafts = this.$_.some(this.act_config, cf => cf.hide_drafts || false)
      // todo this should just check if QP_D is set and make the filter manual
      // so that drafts are also shown on the profile
      if (this.mixin_domain_drafts && !hide_drafts && this.is_pure) { // todo, not sure anymore what is_pure does...
        const include_types = this.get_filtered_template_slugs()
        // console.log(this.$store.getters["entries/domain_drafts"](this.mixin_domain_drafts))
        const drafts = this.$store.getters["entries/domain_drafts"](this.mixin_domain_drafts)
          .reverse().filter(e => include_types.includes(e.template.slug)).map(e => e.uuid)
        result_entries = drafts.concat(result_entries)
      }
      // console.log("new filtered entries", result_entries)
      if (LOG) {
        console.log("Search.filtered_entries. entries:", result_entries.length)
        console.log("e1:", result_entries)
      }
      // this.persist_entries()
      return result_entries
    },
    filterlist_options() {
      return this.include_filters
    }
  },
  methods: {
    search_keypress(keyEvent) {
      if (keyEvent.keyCode === 13) {
        this.$router.push(route_change_query(this.$route))
        this.get_entries(false,true)
      }
    },
    get_entries(before_last = false, debounce = true) {
      const select_uuids = this.select_uuids_config()
      if (select_uuids) {
        this.fetch_select_uuids(select_uuids)
      } else {
        let config = this.searchConfiguration(before_last)
        // console.log("Search.config", config)
        if(!before_last) {
          this.$store.commit("search/clear_entries")
          this.$store.commit("search/set_search_count", 0)
        }
        this.$store.commit(SEARCH_SET_ROUTE, this.act_relevant_route_data())
        this.$store.commit(SEARCH_SET_SEARCHING, true)

        // const prepend = this.entries().length > 0
        if(debounce) {
          debounced_search(this.$api, this.$store, config)
        } else {
          search_entries(this.$api, this.$store, config)
        }
      }
      // TODO would be nice to have the debounced search work with a promise so we do not need the have done-flags in the store...
    },
    fetch_select_uuids(select_uuids) {
      // todo this whole part does not consider pagination... more than 40 entries.
      this.get_complete_missing_meta(select_uuids).then(result => {
        if (typeof result === "boolean") {
          this.$store.commit(SEARCH_SET_ENTRIES, select_uuids)
          this.$store.commit(SEARCH_SET_SEARCH_COUNT, select_uuids.length)
        } else if (result.status === 200) {
          const entries = this.$_.get(result, "data.data.entries", [])
          this.store_received_entries(entries)
          const uuids = entries.map(e => e.uuid)
          this.$store.commit(SEARCH_SET_ENTRIES, uuids)
          this.$store.commit(SEARCH_SET_SEARCH_COUNT, uuids.length)
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
      this.$store.commit(SEARCH_SET_SEARCHING, true)
      const offset = this.$store.getters[SEARCH_RECEIVED_ENTRIES]
      debounced_search(this.$api, this.$store, config, offset)
    },
    ...mapMutations({"clear": "search/clear"}),
    searchConfiguration(before_last = false) {
      let configuration = {
        required: [],
        include: {}
      }
      for (let filter of this.search_config) {
        configuration.required.push(filter)
      }
      const filterlist_options = this.filterlist_options
      for (let filter of this.act_config) {
        const filter_option = filterlist_options.find(fo => fo.name === filter.name)
        // all configs must be contained in the options, maybe not the best method... uuids_select doesnt need to be there
        if (filter_option) {
          const config = filter_option.search_config
          if (config.hasOwnProperty("name")) {
            config.conditional_value = filter.value
            configuration.required.push(config)
          } else if (config.hasOwnProperty("include_as")) {
            configuration.include[config.include_as] = filter.value
          } else {
            console.log("error cannot proccess filter-option", filter.name)
          }
        } else {
          console.log(filter, "not in options")
        }
      }
      if (before_last) {
        const ts = this.$store.getters[SEARCH_GET_SEARCHTIME]
        if (ts)
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
  },
}
</script>

<style scoped>
</style>

