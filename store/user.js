import {ADMIN, DOMAIN_LANGUAGE, EDITOR, UI_LANGUAGE, VISITOR} from "~/lib/consts";
import {default_settings} from "~/lib/settings"

let default_user_data = {
  global_role: VISITOR,
  public_name: VISITOR,
  registered_name: VISITOR, // TODO should also retrieve that... with a number index
  description: "",
  email: null,
  email_validated: false,
  // interested_topics: [],
  // https://stackoverflow.com/questions/1253499/simple-calculations-for-working-with-lat-lon-km-distance
  // of 1 degree will result in error of around 50km per coordinate -0.5, +0.5 degree change around the real location
  // location: "",
  config_share: {}
}


export const state = () => ({
  logged_in: false, // todo should go somewhere else, so persist doesnt mess it up.
  user_data: default_user_data,
  // is set during initialization, logout...
  settings: {},
})

export const getters = {
  logged_in(state, getters) {
    return getters.registered_name !== VISITOR
  },
  registered_name(state) {
    return state.user_data.registered_name
  },
  global_role(state) {
    return state.user_data.global_role
  },
  is_editor(state, getters) {
    return getters.global_role === EDITOR
  },
  is_admin(state, getters) {
    return getters.global_role === ADMIN
  },
  is_editor_or_admin(state, getters) {
    return getters.is_editor || getters.is_admin
  },
  settings(state) {
    return state.settings
  },
  settings_value(state) {
    return (settings_key) => {
      return state.settings[settings_key]
    }
  },
  settings_domain_language(state, getters) {
    return getters.settings_value(DOMAIN_LANGUAGE)
  },
  settings_ui_language(state, getters) {
    return getters.settings_value(UI_LANGUAGE)
  },
  meta_aspects(state) {
    return state.meta_aspects || []
  },
  config(state) {
    return state.user_data.config_share
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
  set_settings(state, settings) {
    state.settings = settings
  },
  change_setting(state, data) {
    // console.log("change_setting", data)
    for (let key in data) {
      $nuxt.$set(state.settings, key, data[key])
    }
  },
  meta_aspects(state, merge_data) {
    state.meta_aspects = Object.assign(state.meta_aspects, merge_data)
  }
}

export const actions = {
  login({commit}, user_data) {
    // console.log("login-action")
    const {settings, ...user} = user_data
    commit("set_settings", settings)
    commit("set_user_data", user)
    // commit("set_auth_token", {access_token, token_type, expiration_date})
    commit("login")
  },
  logout({commit, getters}) {
    // console.log("logout-action")
    commit("set_user_data", Object.assign({}, default_user_data))
    commit("set_settings", Object.assign({}, default_settings, {
      "ui_language": getters.settings_ui_language,
      "domain_language": getters.settings_domain_language
    }))
    commit("logout")
  }
}

