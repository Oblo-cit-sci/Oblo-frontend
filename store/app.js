import Vue from "vue"

export const state = () => ({
    db_loaded: false,
    initialized: false,
    connecting: false,
    connected: false,
    privacy_sheet_open: true,
    dev: {}, // arbitrary data collected during development
    platform: {},
    standalone: false,
    oauth_services: [],
    menu: {}
  }
)

export const mutations = {
  db_loaded(state) {
    state.db_loaded = true
  },
  initialized(state) {
    state.initialized = true
  },
  connecting(state, connecting) {
    state.connecting = connecting
  },
  connected(state, connected) {
    state.connected = connected
  },
  close_privacy_sheet(state) {
    state.privacy_sheet_open = false
  },
  set_dev(state, {data, merge}) {
    // console.log(data, merge)
    if (merge) {
      state.dev = Object.assign(state.dev, data)
    } else {
      state.dev = data
    }
  },
  platform_data(state, data) {
    state.platform = data
  },
  oauth_services(state, services) {
    state.oauth_services = services
  },
  set_menu_to(state, {name, to}) {
    Vue.set(state.menu, name,  to)
  },
  standalone(state, standalone) {
    state.standalone = standalone
  }
}

export const getters = {
  db_loaded(state) {
    return state.db_loaded
  },
  initialized(state) {
    return state.initialized
  },
  connecting(state) {
    return state.connecting
  },
  connected(state) {
    return state.connected
  },
  privacy_sheet_open(state) {
    return state.privacy_sheet_open
  },
  get_dev(state) {
    return state.dev
  },
  platform_data(state) {
    return state.platform
  },
  oauth_services(state) {
    return state.oauth_services
  },
  standalone(state) {
    return state.standalone
  }
}

export const actions = {
  connected({commit}) {
    commit("connecting", false)
    commit("connected", true)
  }
}
