/*
  this is for the user (and maybe others)
 */

import {VISITOR} from "../lib/consts";

const uuidv4 = require('uuid/v4')

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
  uid: null,
  auth_token: {
    access_token: null,
    token_type: "",
    expiration_date: Date()
  }
}


export const state = () => ({
  logged_in: false, // todo should go somewhere else, so persist doesnt mess it up.
  user_data: default_user_data,
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
  user_uid(state) {
    return state.user_data.uid
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
  _rnd_uid(state) {
    state.user_data.uid = uuidv4()
  },
  login(state) {
    state.logged_in = true
  },
  set_auth_token(state,auth_token) {
    state.auth_token = auth_token
  }
}

export const actions = {
  guarantee_uuid(context) {
    if(!context.state.user_data.uid) {
      context.commit("_rnd_uid")
    }
  },
  login({commit}, data) {
    data["auth_token"] = {}
    for(let k of ["access_token", "token_type", "expiration_date"]) {
      data["auth_token"][k] = data[k]
      delete data[k]
    }
    commit("set_user_data", data)
    commit("login")
  },
  logout({commit}) {
    commit("set_user_data", default_user_data)
    commit("logout")
  }
}


