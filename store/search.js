export const state = () => ({
  entries: new Map(),
  entry_aspects: new Map(),
  search_count: 0
});

export const mutations = {
  set_entries(state, entries) {
    state.entries = new Map()
    state.entry_aspects = new Map()
    for(let entry of entries) {
      state.entries.set(entry.uuid,entry)
      // todo later.. bring back aspects that contain search results
      // if(entry.length > 1) {
      //   let aspects_names = state.entry_aspects.get(entry[0]) || []
      //   aspects_names.push(entry[2])
      //   state.entry_aspects.set(entry[0], aspects_names)
      // }
    }
  },
  clear(state) {
    // yes, instead of state.entries.clear(), which won't trigger any update
    state.entries = new Map()
    state.entry_aspects = new Map()
  },
  set_search_count(state, count) {
    state.search_count = count
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
  }
}
