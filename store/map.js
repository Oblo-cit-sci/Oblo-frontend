export const state = () => ({
  marker: null,
  entries: []
})

export const mutations = {
  marker_point(state, coordinate) {
    state.marker = coordinate
  },
  set_entries(state, entries) {
    state.entries = entries
  },
  clear(state) {
    state.entries.clear()
  }
}

export const getters = {
  entries(state) {
    return state.entries
  }
}
