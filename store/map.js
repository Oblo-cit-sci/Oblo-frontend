export const state = () => ({
  marker: null,
  entries: [],
  selected_entry: null,
  goto_location: null,
  layers: ["climate type copy", "weather stations"],
  layer_status: {

  }
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
  },
  goto_location(state, location) {
    state.goto_location = location
  },
  set_layer_status(state, layer_status) {
    state.layer_status = layer_status
  }
}

export const getters = {
  entries(state) {
    return state.entries
  },
  selected_entry(state) {
    return state.selected_entry
  },
  goto_location(state) {
    return () => {
      return state.goto_location}
  },
  layers(state) {
      return state.layers
  },
  layer_status(state) {
    return state.layer_status
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
