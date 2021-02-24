

export const state = () => ({
    db_loaded: false,
    initialized: false,
    connecting: false,
    connected: false,
    privacy_sheet_open: true,
    dev: {}, // arbitrary data collected during development
    platform: {}
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
    console.log(data, merge)
    if(merge) {
      state.dev = Object.assign(state.dev, data)
    } else {
      state.dev = data
    }
  },
  platform_data(state, data) {
    state.platform = data
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
  }
}

export const actions = {
  connected({commit}) {
    commit("connecting", false)
    commit("connected", true)
  }
}
