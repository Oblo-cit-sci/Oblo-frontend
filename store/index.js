import {NO_DOMAIN, TITLE, VISITOR} from "~/lib/consts";
import {object_list2options} from "~/lib/options";
import {TEMPLATES_ADD_TEMPLATES} from "~/store/templates";
import {USER_LOGOUT} from "~/store/user"

// *********** Index
export const SET_STORED_ENTRIES = "set_stored_entries"
export const GET_CODE = "get_code"
export const SET_TEMPLATES_CODES = "set_templates_codes"
export const CLEAR_ENTRIES = "clear_entries"
export const INIT_PAGE_PATH = "init_page_path"
export const PUSH_PAGE_PATH = "push_page_path"
export const POP_LAST_PAGE_PATH = "pop_last_page_path"
export const USER = "user"
export const LAST_BASE_PAGE_PATH = "last_page_path"
export const ALL_CODES = "all_codes"
// internal mutations
export const ADD_CODES = "add_codes"


export const state = () => ({
  codes: {},
  page_path: [],
  aspect_value_cache: {},
  available_languages: []
})

const ld = require('lodash')

export const mutations = {
  add_codes(state, code_arr) {
    for (let code_entry of code_arr) {
      state.codes[code_entry.slug] = code_entry
    }
  },
  init_page_path(state, route) {
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
  get_code(state) {
    return (code_name) => {
      return (state.codes[code_name])
    }
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
  all_codes(state) {
    return state.codes
  },
  get_aspect_cache(state) {
    return (template_slug, aspect_name) => {
      const template_cache = state.aspect_value_cache[template_slug]
      // console.log("store template_cache", template_cache)
      if (template_cache) {
        return template_cache[aspect_name]
      }
    }
  }
};

export const actions = {
  clear_entries({commit}) {
    commit("entries/clear")
    commit("search/clear")
  },
  set_templates_codes(context, entries) {
    context.commit(TEMPLATES_ADD_TEMPLATES, entries.filter(e => e.type === "template"))
    context.commit(ADD_CODES, entries.filter(e => e.type === "code"))
  },
  logout({commit, dispatch}) {
    dispatch(CLEAR_ENTRIES)
    dispatch(USER_LOGOUT)
    commit("search/clear")
  }
}

