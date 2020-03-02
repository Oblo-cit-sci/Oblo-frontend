export const state = () => ({
  entries: new Map(),
  searching: false,
  entry_aspects: new Map(),
  search_count: 0
});

export const mutations = {
  set_entries(state, entries) {
    state.entries = new Map()
    state.entry_aspects = new Map()
    for (let entry of entries) {
      state.entries.set(entry.uuid, entry)
    }
  },
  clear(state) {
    // yes, instead of state.entries.clear(), which won't trigger any update
    state.entries = new Map()
    state.entry_aspects = new Map()
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
    return () => Array.from(state.entries.values())
  },
  get_entry_aspects(state) {
    return (entry_uuid) => {
      return state.entry_aspects.get(entry_uuid) || []
    }
  },
  get_entry(state) {
    return (uuid) => {
      return state.entries.get(uuid)
    }
  },
  get_search_count(state) {
    return state.search_count
  },
  get_searching(state) {
    return () => {
      return state.searching
    }
  }
}
