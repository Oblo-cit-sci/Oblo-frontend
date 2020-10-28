

export const state = () => ({
    db_loaded: false,
    initialized: false,
    connecting: false,
    connected: false,
    privacy_sheet_open: true
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
  }
}

export const actions = {
  connected({commit}) {
    commit("connecting", false)
    commit("connected", true)
  }
}
