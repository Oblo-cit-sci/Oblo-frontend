/*
  this is for the user (and maybe others)
 */

import {VISITOR} from "../lib/consts";


// Mutations
export const USER_LOGIN = "user/login"
export const USER_LOGOUT = "user/logout"
export const USER_LOGGED_IN = "user/logged_in"
export const USER_SET_USER_DATA = "user/set_user_data"
export const USER_RESET_AUTH_TOKEN = "user/reset_auth_token"
export const USER_SET_AUTH_TOKEN = "user/set_auth_token"
export const USER_GET_AUTH_TOKEN = "user/get_auth_token"


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
  location_error: 2,
  defaultLicense: "CC-BY", // should come from the server
  defaultPrivacy: "public",
  location: "",
}


export const state = () => ({
  logged_in: false, // todo should go somewhere else, so persist doesnt mess it up.
  user_data: default_user_data,
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
  get_user_data(state) {
    return state.user_data
  },
  get_auth_token(state) {
    return state.auth_token
  }
}

export const mutations = {
  logout(state) {
    state.logged_in = false
  },
  set_user_data(state, user_data) {
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
  }
}

export const actions = {
  login({commit}, data) {
    const {access_token, token_type, expiration_date, ...user_data} = data
    commit("set_user_data", user_data.user)
    commit("set_auth_token", {access_token, token_type, expiration_date})
    commit("login")
  },
  logout({commit}) {
    commit("set_user_data", default_user_data)
    commit("logout")
    commit("reset_auth_token")
  }
}

