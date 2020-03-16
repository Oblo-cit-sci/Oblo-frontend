// ******** VIEW_SEARCH
export const SEARCH_GET_ENTRIES = "search/get_entries"
export const SEARCH_ENTRY_ASPECT = "search/get_entry_aspects"
export const SEARCH_CLEAR = "search/clear"
export const SEARCH_SET_ENTRIES = "search/set_entries"
export const SEARCH_APPEND_ENTRIES = "search/append_entries"
export const SEARCH_SET_PATH = "search/set_path"

export const SEARCH_PREPEND_ENTRIES = "search/prepend_entries"
export const SEARCH_GET_ENTRY = "search/get_entry"
export const SEARCH_SET_SEARCH_COUNT = "search/set_search_count"
export const SEARCH_GET_SEARCH_COUNT = "search/get_search_count"
export const SEARCH_RECEIVED_ENTRIES = "search/get_received_entries"
export const SEARCH_GET_PATH = "search/get_path"

const ld = require("lodash")

export const state = () => ({
  entries: [],
  searching: false,
  entry_aspects: [],
  search_count: 0,
  path: ""
});

export const mutations = {
  set_entries(state, entries) {
    state.entries = entries
  },
  set_path(state, path) {
    state.path = path
  },
  prepend_entries(state, entries) {
    state.entries = ld.concat(entries, state.entries)
  },
  append_entries(state, entries) {
    state.entries = ld.concat(state.entries, entries)
  },
  clear(state) {
    // yes, instead of state.entries.clear(), which won't trigger any update
    state.entries = []
    state.entry_aspects = []
    state.search_count = 0
  },
  set_search_count(state, count) {
    state.search_count = count
  },
  set_searching(state, searching) {
    state.searching = searching
  }
}

export const getters = {
  get_entries(state) {
    return () => state.entries
  },
  get_path(state) {
    return state.path
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
  }
}

