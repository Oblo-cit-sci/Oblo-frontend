const ld = require("lodash")

export const state = () => ({
  marker: null,
  entries: [],
  selected_entry: null,
  goto_location: null,
  layers: ["Climate types", "Weather stations"],
  layer_status: {},
  to_select_aspect_location: null // when coming from a locationAspect, comes with
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
  },
  set_to_select_aspect_location(state, aspect_location) {
    state.to_select_aspect_location = aspect_location
  },
  reset_to_select_aspect_location(state, aspect_location) {
    state.to_select_aspect_location = null
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
  },
  to_select_aspect_location(state) {
    return state.to_select_aspect_location
  }
}

export const actions = {
  select_entry(context, uuid) {
    //console.log(context)
    let entry = context.rootGetters["entries/get_entry"](uuid)
    context.commit("select_entry", entry)
    console.log(entry.title)
  },
  // filters entries that have a location set
  set_entries({commit}, entries) {
    const location_entries = ld.filter(entries, e => e.location !== null && e.location !== undefined)
    commit("set_entries", location_entries)
  }
}
