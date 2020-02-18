import {NO_DOMAIN, TITLE, VISITOR} from "../lib/consts";
import {object_list2options} from "../lib/options";
import {ENTRYTYPES_TYPENAME, SET_DOMAIN_TEMPLATES_FETCHED} from "../lib/store_consts";
import {ADD_CODES, ENTRYTYPES_ADD_TEMPLATES} from "~/lib/store_consts";

export const state = () => ({
  // comes by init
  db_loaded: false,
  initialized: false,
  _connecting: false,
  connected: false,
  codes: {},
  // recent
  // momentary
  snackbar: {message: "", status: "ok", trigger: false},
  global_ref: null, // the last draft/entry
  draft_numbers: {},
  meta: {
    repository: {}
  },
  domains: [],
  domain: {
    value: NO_DOMAIN,
    title: "OpenTEK",
    icon: "images/openTEK_icon.png"
  },
  // prevent that the save and back is messing up, should not go back to a child. e.g.
  // stores either domain or my entries page or a parent entry
  page_path: []
})

const ld = require('lodash')

export const mutations = {
  // for db setter during INIT
  //
  init(state, data) {
    state.codes = {...data.codes}
    // TODO dispatch
    state.entrytypes.entry_types = new Map(data.entryTemplates);
    state.related_users = data.related_users || {};
    state.domains = data.domains
    state.initialized = true
  },
  set_domains(state, domain_arr) {
    state.domains = domain_arr
    state.initialized = true
  },
  set_domain_templates_fetched(state, domain_name) {
    state.domains.filter(d => d.name === domain_name)[0].templates_fetched = true
  },
  add_codes(state, code_arr) {
    for(let code_entry of code_arr) {
      state.codes[code_entry.slug] = code_entry
    }
  },
  db_loaded(state) {
    state.db_loaded= true
  },
  backup_init(state, data) {
    // called in the middleware
    if (!state.initialized) {
      state.codes = {...data.codes}
      // TODO dispatch
      console.log(data.entryTemplates)
      // backup_used_entrytype_versions()
      state.entrytypes.entry_types = new Map(data.entryTemplates)
      state.domains = data.domains
      console.log("store backup_init, setting init")
      //console.log("backup etypes", state.entry_types)
      state.initialized = true
    } else {
      console.log("store.backup_init: already initialized")
    }
  },
  set_related_users(state, related_users) {
    state.related_users = related_users
  },
  snackbar(state, snackbar) {
    console.log("snack", snackbar, "state", state.snackbar)
    // should be set with {message: str, ok: boolean}
    // method 1 . verbose
    // state.snackbar.message = snackbar.message
    // state.snackbar.trigger = true
    // state.snackbar.ok = snackbar.ok
    // method 2 . as lame as anything
    // Object.assign(state.snackbar, snackbar)
    // state.snackbar.trigger = true
    // method
    state.snackbar = Object.assign(snackbar, {trigger: true})
    console.log("final snackbar", state.snackbar)
  },
  snackbar_reset(state) {
    state.snackbar.trigger = false
  },
  connection(state, connected) {
    state.connected = connected
  },
  set_global_ref(state, uuid) {
    state.global_ref = {uuid: uuid}
  },
  add_aspect_loc(state, aspect_loc) {
    state.global_ref.aspect_loc = aspect_loc
  },
  clear(state) {
    state.global_ref = {}
    state.initialized = false
  },
  update_draft_number(state, type_slug) {
    state.draft_numbers[type_slug] = (state.draft_numbers[type_slug] || 0) + 1
  },
  connecting(state, conn) {
    state._connecting = conn
  },
  add_meta(state, data) {
    //console.log("store, add_meta", state.meta, data)
    state.meta = {...state.meta, ...data}
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
  set_stored_entries(state, entries) {
    state.entries.entries = entries
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
    state.page_path = [route]
  },
  push_page_path(state, route) {
    state.page_path.push(route)
  },
  pop_last_page_path(state) {
    state.page_path.pop()
  }
};

export const getters = {
  db_loaded(state) {
    return () => {
      return state.db_loaded
    }
  },

  get_domain_templates_fetched(state) {
    return (domain_name) => {
      return state.domains.filter(d => d.name === domain_name).templates_fetched
    }
  },
  visitor(state) {
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
  user_key(state) {
    return state.meta.repository.user_key || ""
  },
  initialized(state) {
    return () => {
      return state.initialized
    }
  },
  connecting(state) {
    return state._connecting
  },
  connected(state) {
    return state.connected
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
  containing_template_options(state, getters) {
    return () => {
      const types = new Set()
      for (let entry of state.entries.entries.values()) {
        types.add(entry.template.slug)
      }
      // console.log("conaining_types_options", types)
      // console.log("as array", Array.from(types))
      return Array.from(types).map(type => {
        return {value: type, text: getters[ENTRYTYPES_TYPENAME](type)}
      })
    }
  },
  last_page_path(state) {
    if (state.page_path.length > 0)
      return state.page_path[state.page_path.length - 1]
    else
      return null
  }
};

export const actions = {
  clear_entries({commit}) {
    commit("entries/clear")
    commit("search/clear")
    commit("clear_draft_numbers")
  },
  set_templates_codes_for_domain(context, {domain_name, entries}) {
    if(domain_name !== NO_DOMAIN) {
      context.commit(SET_DOMAIN_TEMPLATES_FETCHED, domain_name)
    }
    context.commit(ENTRYTYPES_ADD_TEMPLATES, entries.filter(e => e.type === "template"))
    context.commit(ADD_CODES, entries.filter(e => e.type === "code"))
  }
}
