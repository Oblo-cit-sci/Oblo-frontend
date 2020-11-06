import {entry_location2geojson_arr} from "~/lib/location"

const ld = require("lodash")

export const state = () => ({
  entries_loaded: false,
  entries: {},
  // todo, could be managed by the $bus
  goto_location: null,
  last_goto_location: null,
  layer_status: null,
  cached_camera_options: {},
  search_time: null,
})

export const mutations = {
  add_entries(state, {domain, entries}) {
    if (state.entries.hasOwnProperty(domain)) {
      // console.log("setting", domain, entries)
      // console.log("LLEE", state.entries[domain].features.length)
      // console.log("+", entries.features.length)
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
    state.search_time = time
  },
  set_entries_loaded(state, loaded) {
    state.entries_loaded = loaded
  },
  set_filter_config(state, filter_config) {
    state.filter_config = filter_config
  },
  set_entry_feature(state, {domain_name, uuid, feature}) {
    const f_index = state.entries[domain_name].features.findIndex(f => f.properties.uuid === uuid)
    state.entries[domain_name].features[f_index] = feature
  },
  delete_feature(state, {domain_name, uuid}) {
    const f_index = state.entries[domain_name].features.findIndex(f => f.properties.uuid === uuid)
    state.entries[domain_name].features.splice(f_index, 1)
  },
  update_entry_features(state, {domain, entry_features}) {
    if (state.entries.hasOwnProperty(domain)) {
      // console.log("in", entry_features, entry_features[0].properties.uuid)
      // console.log(state.entries[domain].features)
      const existing = ld.filter(state.entries[domain].features, f => f.properties.uuid !== entry_features[0].properties.uuid)
      // console.log("f", ld.filter(state.entries[domain].features, f => f.properties.uuid === entry_features[0].properties.uuid))
      state.entries[domain].features = ld.concat(existing,  entry_features)
      console.log(ld.concat(existing,  entry_features).length)
    }
  },
  clear_searchtime(state) {
    state.search_time =null
  }
}

export const getters = {
  entries_loaded(state) {
    return state.entries_loaded
  },
  entries(state) {
    return (domain) => {
      return state.entries[domain] || {}
    }
  },
  get_search_time(state) {
    return state.search_time
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
  },
  get_filter_config(state) {
    return state.filter_config
  },
  get_by_uuids(state) {
    return (uuids) => {
      let map_entries = []
      for (let domain_entries_features of Object.values(state.entries)) {
        map_entries = map_entries.concat(ld.filter(domain_entries_features.features, e => uuids.includes(e.properties.uuid)))
      }
      return map_entries
    }
  },
  get_by_uuid(state) { // not used atm
    return (uuid) => {
      for (let domain_entries_features of Object.values(state.entries)) {
        // console.log(domain_entries_features.features)
        const feature = ld.find(domain_entries_features.features, e => e.properties.uuid === uuid)
        if (feature)
          return feature
      }
      console.log("warning entry_feature for uuid not found")
      return null
    }
  },
  get_entry_and_domain_by_uuid(state) {
    return (uuid) => {
      for (let domain_name of Object.keys(state.entries)) {
        // console.log(domain_entries_features.features)
        const domain_entries_features = state.entries[domain_name]
        const feature = ld.find(domain_entries_features.features, e => e.properties.uuid === uuid)
        if (feature)
          return {feature, domain_name}
      }
      console.log("warning entry_feature for uuid not found")
      return null
    }
  }
}

export const actions = {
  // filters entries that have a location set
  add_entries({commit}, {domain, entries, ts}) {
    commit("set_entries_loaded", true)
    commit("add_entries", {domain, entries})
    commit("set_searchtime", ts)
  },
  goto_done(context) {
    const goto_loc = context.getters.goto_location()
    context.commit("_last_goto_location", goto_loc)
    context.commit("goto_location", null)
  },
  // reset_goto_locations(context) {
  //   context.commit("_last_goto_location", null)
  //   context.commit("goto_location", null)
  // },
  set_entry_feature(context, {uuid, property_name, value}) {
    const res = context.getters.get_entry_and_domain_by_uuid(uuid)
    if (!res) {
      console.log("error in map/set_entry_property, no entry for given uuid", uuid)
      return
    }
    const {feature, domain_name} = ld.cloneDeep(res)
    feature.properties[property_name] = value
    context.commit("set_entry_feature", {domain_name, uuid, feature})
  }
}
