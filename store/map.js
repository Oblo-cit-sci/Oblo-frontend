
const ld = require("lodash")

// Mutations
export const MAP_SET_ENTRIES = "map/set_entries"
export const MAP_SET_TO_SELECT_ASPECT_LOCATION = "map/set_to_select_aspect_location"
export const MAP_RESET_TO_SELECT_ASPECT_LOCATION = "map/reset_to_select_aspect_location"
export const MAP_GOTO_LOCATION = "map/goto_location"  // also getter

// this is used when the selection is not for an aspect (e.g. profile location)
export const MAP_SELECTED_LOCATION = "map/selected_location"
export const MAP_GET_SELECTED_LOCATION = "map/get_selected_location"
// Getters
export const MAP_LAST_GOTO_LOCATION = "map/last_goto_location"
// Actions
export const MAP_GOTO_DONE = "map/goto_done"
export const MAP_RESET_GOTO_LOCATIONS = "map/reset_goto_locations"


export const state = () => ({
  marker: null,
  entries: [],
  selected_entry: null,
  goto_location: null,
  last_goto_location: null,
  layers: ["Climate types", "Weather stations", "country-label"],
  layer_status: {},
  to_select_aspect_location: null, // when coming from a locationAspect, comes with
  selected_location: null // when there is no "to_select_aspect_location" e.g. profile
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
  _last_goto_location(state, location) {
    state.last_goto_location = location
  },
  set_layer_status(state, layer_status) {
    state.layer_status = layer_status
  },
  set_to_select_aspect_location(state, aspect_location) {
    state.to_select_aspect_location = aspect_location
  },
  reset_to_select_aspect_location(state) {
    state.to_select_aspect_location = null
  },
  selected_location(state, location) {
    state.selected_location = location
  }
}

export const getters = {
  entries(state) {
    return state.entries
  },
  // selected_entry(state) {
  //   return state.selected_entry
  // },
  goto_location(state) {
    return () => {
      return state.goto_location
    }
  },
  last_goto_location(state) {
    return () => {
      return state.last_goto_location
    }
  },
  layers(state) {
    return state.layers
  },
  layer_status(state) {
    return state.layer_status
  },
  to_select_aspect_location(state) {
    return state.to_select_aspect_location
  },
  get_selected_location(state) {
    return state.selected_location
  }
}

export const actions = {

  // filters entries that have a location set
  set_entries({commit}, entries) {
    const location_entries = ld.filter(entries, e => e.location !== null && e.location !== undefined)
    commit("set_entries", location_entries)
  },
  goto_done(context) {
    const goto_loc = context.getters.goto_location()
    context.commit("_last_goto_location", goto_loc)
    context.commit("goto_location", null)
  },
  reset_goto_locations(context) {
    context.commit("_last_goto_location", null)
    context.commit("goto_location", null)
  }
}
