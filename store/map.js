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
  entries_loaded: false,
  loading_entries: false, // this is for a bug. when creating an entry and going back to domain, the PAGE is created twice?!
  entries: {},
  goto_location: null,
  last_goto_location: null,
  layers: ["Climate types", "country-label"],
  layer_status: {},
  cached_camera_options: {},
  searchtime: null,
})

export const mutations = {
  add_entries(state, {domain, entries}) {
    if(state.entries.hasOwnProperty(domain)) {
      // console.log("setting", domain, entries)
      console.log("LLEE", state.entries[domain].features.length)
      console.log("+", entries.features.length)
      state.entries[domain].features.push(...entries.features)
    } else {
      $nuxt.$set(state.entries, domain, entries)
    }
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
  set_camera_options_cache(state, {domain, options}) {
    state.cached_camera_options[domain] = options
  },
  set_searchtime(state, time) {
    state.searchtime = time
  },
  set_entries_loaded(state, loaded) {
    state.entries_loaded = loaded
  },
  set_loading_entries(state, loading) {
    state.loading_entries = loading
  }
}

export const getters = {
  entries_loaded(state) {
    return state.entries_loaded
  },
  loading_entries(state) {
    return state.loading_entries
  },
  entries(state) {
    return (domain) => {
      return state.entries[domain] || {}
    }
  },
  get_searchtime(state) {
    return state.searchtime
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
  },
  cached_camera_options(state) {
    return (domain) => {
      return state.cached_camera_options[domain]
    }
  }
}

export const actions = {
  // filters entries that have a location set
  add_entries({commit}, {domain, entries, ts}) {
    commit("set_entries_loaded", true)
    commit("set_loading_entries", false)
    commit("add_entries", {domain, entries})
    commit("set_searchtime", ts)
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
