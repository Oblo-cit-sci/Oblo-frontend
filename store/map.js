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
  default_map_style: null,
  access_token: null,
  domain_map_loaded: false
})

export const mutations = {
  guarantee_domain(state, domain) {
    if (!state.entries.hasOwnProperty(domain)) {
      $nuxt.$set(state.entries, domain, {type: "FeatureCollection", features: []})
    }
  },
  // add_entries(state, {domain, entries}) {
  //   state.entries[domain].features.push(...entries.features)
  // },
  clear(state) {
    state.entries_loaded = false // probably not required
    state.entries = {}
    state.search_time = null
    state.cached_camera_options = {}
    state.layer_status = null
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
  // set_filter_config(state, filter_config) {
  //   state.filter_config = filter_config
  // },
  set_entry_feature(state, {domain_name, uuid, feature}) {
    const f_index = state.entries[domain_name].features.findIndex(f => f.properties.uuid === uuid)
    state.entries[domain_name].features[f_index] = feature
  },
  delete_feature(state, {domain_name, uuid}) {
    const f_index = state.entries[domain_name].features.findIndex(f => f.properties.uuid === uuid)
    state.entries[domain_name].features.splice(f_index, 1)
  },
  update_entry_features(state, {domain, entry_features}) {
    const update_uuids = entry_features.map(e => e.properties.uuid)
    const keep_as_is = ld.filter(state.entries[domain].features, f => !update_uuids.includes(f.properties.uuid))
    state.entries[domain].features = ld.concat(keep_as_is, entry_features)
  },
  default_map_style(state, default_map_style) {
    state.default_map_style = default_map_style
  },
  access_token(state, access_token) {
    state.access_token = access_token
  },
  map_loaded(state, loaded) {
    state.domain_map_loaded = loaded
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
  // get_filter_config(state) {
  //   return state.filter_config
  // },
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
        const domain_entries_features = state.entries[domain_name]
        const feature = ld.find(domain_entries_features.features, e => e.properties.uuid === uuid)
        if (feature)
          return {feature, domain_name}
      }
      console.log("warning entry_feature for uuid not found")
      return null
    }
  },
  default_map_style(state) {
    return state.default_map_style
  },
  access_token(state) {
    return state.access_token
  },
  can_show_map(state) {
    return state.default_map_style && state.access_token
  },
  is_map_loaded(state) {
    return state.domain_map_loaded
  }
}

export const actions = {
  // filters entries that have a location set
  update_entry_features({commit}, {domain, entry_features}) {
    commit("guarantee_domain", domain)
    commit("update_entry_features", {domain, entry_features})
  },
  add_entries({commit}, {domain, entries, ts}) {
    commit("set_entries_loaded", true)
    commit("guarantee_domain", domain)
    commit("update_entry_features", {domain, entry_features: entries.features})
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
