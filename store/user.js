import {ADMIN, VISITOR} from "~/lib/consts";
import {default_settings} from "~/lib/settings"

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
  // location: "",
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
  is_admin(state, getters) {
    return getters.global_role === ADMIN
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
  change_setting(state, data) {
    for(let key in data) {
      $nuxt.$set(state.settings, key, data[key])
    }
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

