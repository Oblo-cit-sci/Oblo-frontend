import {VISITOR} from "~/lib/consts";
import {default_settings} from "~/lib/settings"

export const USER_LOGIN = "user/login"
export const USER_LOGOUT = "user/logout"
export const USER_LOGGED_IN = "user/logged_in"
export const USER_SET_USER_DATA = "user/set_user_data"
export const USER_RESET_AUTH_TOKEN = "user/reset_auth_token"
export const USER_SET_AUTH_TOKEN = "user/set_auth_token"
export const USER_GET_AUTH_TOKEN = "user/get_auth_token"
export const USER_GET_REGISTERED_NAME = "user/registered_name"
export const USER_GLOBAL_ROLE = "user/global_role"
export const USER_SETTINGS = "user/settings"
export const USER_SET_SETTINGS = "user/set_settings"


let default_user_data = {
  global_role: VISITOR,
  public_name: VISITOR,
  registered_name: VISITOR, // TODO should also retrieve that... with a number index
  description: "",
  email: null,
  email_validated: false,
  interested_topics: [],
  // https://stackoverflow.com/questions/1253499/simple-calculations-for-working-with-lat-lon-km-distance
  // of 1 degree will result in error of around 50km per coordinate -0.5, +0.5 degree change around the real location
  default_license: "CC0", // should come from the server
  default_privacy: "public",
  location: "",
  config_share: {}
}


export const state = () => ({
  logged_in: false, // todo should go somewhere else, so persist doesnt mess it up.
  user_data: default_user_data,
  settings: default_settings,
  auth_token: {
    access_token: null,
    token_type: "",
    expiration_date: null
  }
})

export const getters = {
  logged_in(state) {
    return state.logged_in
  },
  registered_name(state) {
    return state.user_data.registered_name
  },
  get_auth_token(state) {
    return state.auth_token
  },
  global_role(state) {
    return state.user_data.global_role
  },
  settings(state) {
    return state.settings
  },
  settings_value(state) {
    return (settings_key) => {
      return state.settings[settings_key]
    }
  }
}

export const mutations = {
  logout(state) {
    state.logged_in = false
  },
  set_user_data(state, user_data) {
    // delete user_data.settings
    state.user_data = user_data;
  },
  login(state) {
    state.logged_in = true
  },
  set_auth_token(state, auth_token) {
    state.auth_token = auth_token
  },
  reset_auth_token(state) {
    state.auth_token = {
      access_token: null,
      token_type: "",
      expiration_date: null
    }
  },
  set_settings(state, settings) {
    state.settings = settings
  },
  change_setting(state, {key, value}) {
    $nuxt.$set(state.settings,key, value)
  }
}

export const actions = {
  login({commit}, data) {
    const {access_token, token_type, expiration_date, ...user_data} = data
    const {settings, ...user} = user_data.user
    commit("set_settings", settings)
    commit("set_user_data", user)
    commit("set_auth_token", {access_token, token_type, expiration_date})
    commit("login")
  },
  logout({commit}) {
    commit("set_user_data", Object.assign({}, default_user_data))
    commit("set_settings", Object.assign({}, default_settings))
    commit("logout")
    commit("reset_auth_token")
  }
}

