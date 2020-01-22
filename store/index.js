import {NO_DOMAIN, TITLE, VISITOR} from "../lib/consts";
import {object_list2options} from "../lib/options";
import {ENTRYTYPES_TYPENAME} from "../lib/store_consts";

export const state = () => ({
  // comes by init
  initialized: false,
  _connecting: false,
  connected: false,
  //entry_types: new Map(), // types for creation
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

function extract_liccis(tree) {
  let liccis = [];
  for (let system of tree.children) {
    for (let subsystem of system.children) {
      for (let element of subsystem.children) {
        for (let licci of element.children) {
          liccis.push(licci.name)
        }
      }
    }
  }
  return liccis
}

const ld = require('lodash')

export const mutations = {
  init(state, data) {
    state.codes = {...data.codes}
    state.codes.liccis_flat = extract_liccis(data.codes.liccis);
    // TODO dispatch
    state.entrytypes.entry_types = new Map(data.entryTemplates);
    state.related_users = data.related_users || {};
    state.domains = data.domains
    state.initialized = true
  },
  backup_init(state, data) {
    // called in the middleware
    if (!state.initialized) {
      state.codes = {...data.codes}
      state.codes.liccis_flat = extract_liccis(data.codes.liccis)
      // TODO dispatch
      console.log(data.entryTemplates)
      state.entrytypes.entry_types = new Map(data.entryTemplates)
      state.domains = data.domains
      console.log("store backup_init, setting init")
      //console.log("backup etypes", state.entry_types)
      state.initialized = true
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
    this.state.entries.entries = entries
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
    return domain_value => {
      return state.domains.find(domain => domain.value === domain_value)
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
  conaining_types_options(state, getters) {
    return () => {
      const types = new Set()
      for (let entry of state.entries.entries.values()) {
        // console.log(entry.type_slug)
        types.add(entry.type_slug)
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
  test(context, val) {
    //console.log("text store action", context, val)
  },
  clear_entries({commit}) {
    commit("entries/clear")
    commit("search/clear")
    commit("clear_draft_numbers")
  }
}
