// ******** VIEW_SEARCH
export const SEARCH_GET_ENTRIES = "search/get_entries"
export const SEARCH_ENTRY_ASPECT = "search/get_entry_aspects"
export const SEARCH_CLEAR = "search/clear"
export const SEARCH_SET_ENTRIES = "search/set_entries"
export const SEARCH_APPEND_ENTRIES = "search/append_entries"
export const SEARCH_SET_ROUTE = "search/set_route"
export const SEARCH_SET_SEARCHING = "search/set_searching"
export const SEARCH_SET_SEARCHTIME = "search/set_searchtime"
export const SEARCH_SET_SEARCH_COUNT = "search/set_search_count"
export const SEARCH_INCREASE_COUNT = "search/increase_search_count"
export const SEARCH_DELETE_ENTRY = "search/delete_entry"
export const SEARCH_SET_ALL_UUIDS = "search/set_all_uuids"


export const SEARCH_PREPEND_ENTRIES = "search/prepend_entries"
export const SEARCH_GET_ENTRY = "search/get_entry"

export const SEARCH_GET_SEARCH_COUNT = "search/get_search_count"
export const SEARCH_RECEIVED_ENTRIES = "search/get_received_entries"
export const SEARCH_GET_ROUTE = "search/get_route"
export const SEARCH_GET_SEARCHING = "search/get_searching"
export const SEARCH_GET_SEARCHTIME = "search/get_searchtime"
export const SEARCH_GET_ALL_UUIDS = "search/get_all_uuids"

const ld = require("lodash")

export const state = () => ({
  path: "", // check
  relevant_path_query_values: {}, // ?
  search_term: "",
  act_config: [], // config before search. set by domainMenu.search.filterlist and map_overlays.legend,
  searching: false, // flag for loadin
  entries: [], // result
  entry_aspects: [], // result specifics, not used atm
  search_count: 0, // total count in the db, used for requesting more
  searchtime: null, // used to update,
  all_uuids: null
});

export const mutations = {
  set_entries(state, entries) {
    state.entries = entries
  },
  set_route(state, {path, params}) {
    state.path = path
    state.relevant_path_query_values = params
  },
  set_searchtime(state, time) {
    state.searchtime = time
  },
  prepend_entries(state, entries) {
    state.entries = ld.concat(entries, state.entries)
  },
  append_entries(state, entries) {
    state.entries = ld.concat(state.entries, entries)
  },
  delete_entry(state, uuid) {
    const result = state.entries.filter(e_uuid => e_uuid !== uuid)
    if(result.length < state.entries.length) {
      state.search_count--;
    }
    state.entries = result
  },
  clear(state) {
    // yes, instead of state.entries.clear(), which won't trigger any update
    state.entries = []
    state.entry_aspects = []
    state.search_count = 0
    state.path = ""
    state.searchtime = null
  },
  set_search_count(state, count) {
    state.search_count = count
  },
  set_searching(state, searching) {
    state.searching = searching
  },
  increase_search_count(state, count) {
    state.search_count += count
  },
  set_all_uuids(state, uuids) {
    state.all_uuids = uuids
  },
  set_act_config(state, config) {
    state.act_config = config
  }
}

export const getters = {
  get_entries(state) {
    return () => state.entries
  },
  get_route(state) {
    return {path: state.path, params: state.relevant_path_query_values}
  },
  get_entry_aspects(state) {
    return () => {
      return state.entry_aspects
    }
  },
  get_search_count(state) {
    return state.search_count
  },
  get_searching(state) {
    return () => {
      return state.searching
    }
  },
  get_received_entries(state) {
    return state.entries.length
  },
  get_searchtime(state) {
    return state.searchtime
  },
  get_all_uuids(state) {
    return () => state.all_uuids
  },
  get_act_config(state) {
    return state.act_config
  }
}

