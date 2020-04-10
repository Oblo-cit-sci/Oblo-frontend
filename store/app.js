export const APP_DB_LOADED = "app/db_loaded"
export const APP_INITIALIZED = "app/initialized"
export const APP_CONNECTING = "app/connecting"
export const APP_CONNECTED = "app/connected"


export const state = () => ({
    db_loaded: false,
    initialized: false,
    connecting: false,
    connected: false
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
}

export const actions = {
  connected({commit}) {
    commit("connecting",false)
    commit("connected", true)
  }
}