import {VISITOR} from "~/lib/consts";

export const state = () => ({
  page_path: [],
  aspect_value_cache: {},
  available_languages: []
})

const ld = require('lodash')

export const mutations = {
  init_page_path(state, route) {
    console.log(route)
    // todo, maybe it required more!?! check getter
    state.page_path = [route]
    //  state.page_path = [{
    //    name: route.name, path: route.path,
    //    fullPath: route.fullPath,
    //    query: Object.assign({}, route.query),
    //    params: Object.assign({}, route.params)}] //, name:route.name, params: Object.assign({}, route.params), path:route.path,  query:Object.assign({}, route.query)}]
  },
  push_page_path(state, route) {
    state.page_path.push(route)
  },
  pop_last_page_path(state) {
    state.page_path.pop()
  },
  add_cache(state, {template, aspect, mvalue}) {
    const template_cache = state.aspect_value_cache[template] || {}
    template_cache[aspect] = mvalue
    state.aspect_value_cache[template] = template_cache
  },
  set_available_languages(state, language_codes) {
    state.available_languages = language_codes
  },
  add_language(state, lang_code) {
    const index = state.available_languages.indexOf(lang_code)
    // maybe sorted?
    if (index === -1) {
      state.available_languages = ld.concat(state.available_languages, lang_code)
    }
  },
  remove_language(state, lang_code) {
    state.available_languages = ld.filter(state.available_languages, e => {
      return e !== lang_code
    })
  }
};

export const getters = {
  is_visitor(state) {
    //console.log("visitor check");
    return state.user.user_data.global_role === VISITOR
  },
  user(state) {
    return state.user.user_data
  },
  name(state) {
    return state.user.user_data.registered_name
  },
  username(state) {
    return state.user.user_data.registered_name
  },
  available_languages(state) {
    return state.available_languages
  },
  last_page_path(state) {
    if (state.page_path.length > 0)
      return state.page_path[state.page_path.length - 1]
    else
      return null
  },
  get_aspect_cache(state) {
    return (template_slug, aspect_name) => {
      const template_cache = state.aspect_value_cache[template_slug]
      // console.log("store template_cache", template_cache)
      if (template_cache) {
        return template_cache[aspect_name]
      }
    }
  },
  domain_language(state, getters) {
    return getters["user/settings_value"]("domain_language")
  },
  ui_language(state, getters) {
    return getters["user/settings_value"]("ui_language")
  },
  fixed_domain(state, getters) {
    return getters["user/settings_value"]("fixed_domain")
  },
  menu_page(state) {
    return name => state.app.menu[name]
  }
}

export const actions = {
  clear_entries({commit}) {
    commit("entries/clear", {})
    commit("search/clear")
  },
  logout({commit, dispatch}) {
    dispatch("clear_entries")
    dispatch("user/logout")
    commit("search/clear")
    commit("map/clear")
  },
  set_offline_misc_data({commit}, offline_misc_data) {
    for(let commit_name in offline_misc_data) {
      commit(commit_name, offline_misc_data[commit_name])
    }
  }
}

