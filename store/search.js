export const state = () => ({
  entries: new Map(),
  entry_aspects: new Map()
});

export const mutations = {
  set_entries(state, entries) {
    state.entries = new Map()
    state.entry_aspects = new Map()
    for(let entry of entries) {
      state.entries.set(entry[0],entry[1])
      if(entry.length > 2) {
        let aspects_names = state.entry_aspects.get(entry[0]) || []
        aspects_names.push(entry[2])
        state.entry_aspects.set(entry[0], aspects_names)
      }
    }
  },
  clear(state) {
    // yes, instead of state.entries.clear(), which won't trigger any update
    state.entries = new Map()
    state.entry_aspects = new Map()
  }
}

export const getters = {
  get_entries(state) {
    return Array.from(state.entries.values())
  },
  get_entry_aspects(state) {
    return (entry_uuid) => {
      return state.entry_aspects.get(entry_uuid) || []
    }
  }
}
