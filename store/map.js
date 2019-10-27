export const state = () => ({
  marker: null,
  entries: [],
  selected_entry: null
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
  },
  select_entry(state, entry) {
    state.selected_entry = entry
  }
}

export const getters = {
  entries(state) {
    return state.entries
  },
  selected_entry(state) {
    return state.selected_entry
  }
}

export const actions = {
  select_entry(context, uuid) {
    //console.log(context)
    let entry = context.rootGetters["entries/get_entry"](uuid)
    context.commit("select_entry", entry)
    console.log(entry.title)
  }
}
