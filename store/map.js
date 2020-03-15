import {_SELECT_ENTRY} from "~/lib/store_consts";
import {ENTRIES_GET_ENTRY} from "~/store/entries";

const ld = require("lodash")

export const state = () => ({
  marker: null,
  entries: [],
  selected_entry: null,
  goto_location: null,
  last_goto_location: null,
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
  _last_goto_location(state, location) {
    state.last_goto_location = location
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
  }
}

export const actions = {
  // select_entry(context, uuid) {
  //   //console.log(context)
  //   let entry = context.rootGetters[ENTRIES_GET_ENTRY](uuid)
  //   context.commit(_SELECT_ENTRY, entry)
  //   // console.log(entry.title)
  // },
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
