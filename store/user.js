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
  defaultLicense: "CC0", // should come from the server
  defaultPrivacy: "public",
  location: "",
  uid: null
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
  user_data(state) {
    return state.user_data
  },
  user_uid(state) {
    return state.user_data.uid
  }
}

export const mutations = {
  login(state, data) {
    //console.log("LOGIN");
    //console.log("store data", data.own_entries);
    state.logged_in = true;
    state.user_data = data.user_data;
  },
  logout(state) {
    state.logged_in = false;
    state.user_data = default_user_data;
  },
  set_user_data(state, user_data) {
    state.user_data = user_data;
  },
  _rnd_uid(state) {
    state.user_data.uid = uuidv4()
  }
}

export const actions = {
  guarantee_uuid(context) {
    if(!context.state.user_data.uid) {
      context.commit("_rnd_uid")
    }
  }
}


