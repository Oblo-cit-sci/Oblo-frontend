import {NO_DOMAIN, TITLE, VISITOR} from "~/lib/consts";
import {object_list2options} from "~/lib/options";
import {TEMPLATES_ADD_TEMPLATES} from "~/store/templates";
import {USER_LOGOUT} from "~/store/user"
import {SEARCH_CLEAR} from "~/store/search"

// *********** Index
export const CLEAR_DOMAIN = "clear_domain"
export const UPDATE_DRAFT_NUMBER = "update_draft_number"
// export const DELETE_DOMAIN = "delete_domain"
export const SET_STORED_ENTRIES = "set_stored_entries"
export const SET_DRAFT_NUMBERS = "set_draft_numbers"
export const SET_DOMAINS = "set_domains"
export const GET_CODE = "get_code"
export const SET_TEMPLATES_CODES = "set_templates_codes"
export const CLEAR_ENTRIES = "clear_entries"
export const DOMAINS = "domains"
export const SET_DOMAIN = "set_domain"
export const INIT_PAGE_PATH = "init_page_path"
export const PUSH_PAGE_PATH = "push_page_path"
export const POP_LAST_PAGE_PATH = "pop_last_page_path"
export const UPDATE_DRAFT_NUMBERS = "update_draft_numbers"
export const USER = "user"
export const DOMAIN = "domain"
export const DOMAIN_BY_NAME = "domain_by_name"
export const LAST_BASE_PAGE_PATH = "last_page_path"
export const LOGOUT = "logout"
export const ALL_CODES = "all_codes"
// internal mutations
export const ADD_CODES = "add_codes"
export const DOMAIN_TITLE = "domain_title"

// ******** SNACKBAR
export const SNACKBAR = "snackbar"
export const SNACKBAR_RESET = "snackbar_reset"
export const SNACKBAR_TRIGGER = "snackbar_trigger"


export const state = () => ({
  // comes by init
  codes: {},
  snackbar: {message: "", status: "ok", trigger: false},
  draft_numbers: {},
  domains: [],
  domain: {
    value: NO_DOMAIN,
    title: "OpenTEK"
    // icon: "images/openTEK_icon.png"
  },
  // prevent that the save and back is messing up, should not go back to a child. e.g.
  // stores either domain or my entries page or a parent entry
  page_path: [],
  aspect_value_cache: {}
})

const ld = require('lodash')

export const mutations = {
  set_domains(state, domain_arr) {
    state.domains = domain_arr
  },
  add_codes(state, code_arr) {
    for (let code_entry of code_arr) {
      state.codes[code_entry.slug] = code_entry
    }
  },
  snackbar(state, snackbar) {
    state.snackbar = Object.assign(snackbar, {trigger: true})
    // console.log("final snackbar", state.snackbar.trigger)
  },
  snackbar_reset(state) {
    state.snackbar.trigger = false
  },
  update_draft_number(state, type_slug) {
    state.draft_numbers[type_slug] = (state.draft_numbers[type_slug] || 0) + 1
  },
  clear_draft_numbers(state) {
    state.draft_numbers = {}
  },
  set_domain(state, domain) {
    state.domain = domain
  },
  clear_domain(state) {
    state.domain = {
      value: NO_DOMAIN,
      title: "OpenTEK",
      icon: "images/openTEK_icon.png"
    }
  },
  set_draft_numbers(state, draft_numbers) {
    state.draft_numbers = draft_numbers
  },
  delete_domain(state, domain_name) {
    state.domains = ld.filter(state.domains, domain => domain.value !== domain_name)
  },
  update_draft_numbers(state, entries) { // UPDATE_DRAFT_NUMBERS
    for (let entry of entries) {
      state.draft_numbers[entry.type_slug] = (state.draft_numbers[entry.type_slug] || 0) + 1
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
  }
};

export const getters = {
  snackbar_trigger(state) {
    return () => {
      return state.snackbar.trigger
    }
  },
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
  get_code(state) {
    return (code_name) => {
      return (state.codes[code_name])
    }
  },
  draft_numbers(state) {
    return state.draft_numbers
  },
  draft_no(state) {
    return (type_slug) => {
      return state.draft_numbers[type_slug] || 0
    }
  },
  domain(state) {
    return state.domain
  },
  domain_by_name(state) {
    return domain_name => {
      return state.domains.find(domain => domain.name === domain_name)
    }
  },
  domain_title(state) {
    return state.domain.title
  },
  domains(state) {
    return state.domains
  },
  domain_options(state) {
    return () => {
      return object_list2options(state.domains, TITLE)
    }
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
      console.log("store template_cache", template_cache)
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
    commit("clear_draft_numbers")
  },
  set_templates_codes(context, entries) {
    context.commit(TEMPLATES_ADD_TEMPLATES, entries.filter(e => e.type === "template"))
    context.commit(ADD_CODES, entries.filter(e => e.type === "code"))
  },
  logout({commit, dispatch}) {
    dispatch(CLEAR_ENTRIES)
    dispatch(USER_LOGOUT)
    commit(SEARCH_CLEAR)
    commit("app/fixed_domain", null)
  }
}

