const ld = require("lodash")

// Mutations
export const MAP_SET_ENTRIES = "map/set_entries"
// not used anymore with the new map
export const MAP_GOTO_LOCATION = "map/goto_location"  // also getter
export const MAP_RESET_GOTO_LOCATIONS = "map/reset_goto_locations"

// Getters
export const MAP_LAST_GOTO_LOCATION = "map/last_goto_location"
// Actions
export const MAP_GOTO_DONE = "map/goto_done"


export const state = () => ({
  entries: {},
  goto_location: null,
  last_goto_location: null,
  layers: ["Climate types", "country-label"],
  layer_status: {},
})

export const mutations = {
  set_entries(state, {domain, entries}) {
    // console.log("setting", domain, entries)
    $nuxt.$set(state.entries, domain, entries)
  },
  clear(state) {
    state.entries.clear()
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
}

export const getters = {
  entries(state) {
    return (domain) => {
      return state.entries[domain] || {}
    }
  },
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
  }
}

export const actions = {

  // filters entries that have a location set
  set_entries({commit}, data) {
    // console.log("set entries", data.domain, data.entries)
    // const location_entries = ld.filter(entries, e => e.location !== null && e.location !== undefined)
    commit("set_entries", data)
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
