import {EDIT, NO_DOMAIN, TITLE, VISITOR} from "../lib/consts";
import {entries_domain_filter} from "../lib/search";
import {object_list2options} from "../lib/options";

export const state = () => ({
  // comes by init
  initialized: false,
  _connecting: false,
  connected: false,
  entry_types: new Map(), // types for creation
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
    title: "OpenTEK"
  }
  // selected entry type (for creation)
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
    state.entry_types = new Map(data.entryTemplates);
    state.related_users = data.related_users || {};
    //state.entry_type_slug_index_dict = array_to_val__id_dict(data.entryTemplates, "slug");
    state.initialized = true
  },
  backup_init(state, data) {
    // calld in the middleware
    if (!state.initialized) {
      state.codes = {...data.codes}
      state.codes.liccis_flat = extract_liccis(data.codes.liccis);
      state.entry_types = new Map(data.entryTemplates)
      state.domains = data.domains
      state.initialized = true
    }
  },
  set_related_users(state, related_users) {
    state.related_users = related_users
  },
  entrytype(state, newtype) {
    state.entry_types[newtype.type_slug] = newtype;
    //state.entry_type_slug_index_dict[newtype.slug] = state.available_entries.length - 1;
  },
  // should be set with {message: str, ok: boolean}
  snackbar(state, snackbar) {
    state.snackbar = Object.assign(snackbar, {trigger:true})
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
    state.draft_numbers[type_slug] = (state.draft_numbers[type_slug] || 1) + 1
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
      title: "OpenTEK"
    }
  },
  set_stored_entries(state, entries) {
    this.state.entries.entries = entries
  },
  set_draft_numbers(state, draft_numbers) {
    state.draft_numbers = draft_numbers
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
  // entry-types
  global_entry_types_as_array(state) {
    // todo generalize, e.g. array of 2val array ["context", "global"]
    let global_entry_types = [];
    for (let entry of state.entry_types.values()) {
      if (entry.content.meta.context === "global") {
        global_entry_types.push(entry)
      }
    }
    return global_entry_types
  },
  entry_type(state) {
    return (entry_or_type_slug) => {
      if(typeof  entry_or_type_slug === "object") {
        return state.entry_types.get(entry_or_type_slug.type_slug)
      } else {
        return state.entry_types.get(entry_or_type_slug)
      }
    }
  },
  entrytypes(state) {
    return Array.from(state.entry_types.values())
  },
  entrytypes_of_domain(state) {
    return domain => {
      return entries_domain_filter(Array.from(state.entry_types.values()), domain)
    }
  },
  get_aspect_def(state, getters, root_state, root_getter) {
    return ({type_slug, aspect_name}) => {
      let type = root_getter.entry_type(type_slug)
      return type.content.aspects.find(a => {
        return a.name === aspect_name
      })
    }
  },
  get_aspect_index(state) {
    return (type_slug, aspect_name) => {
      return ld.findIndex(state.entry_types.get(type_slug).content.aspects, (a) => a.name === aspect_name)
    }
  },
  get_aspect(state) {
    return (type_slug, aspect_name) => {
      return ld.find(state.entry_types.get(type_slug).content.aspects, (a) => a.name === aspect_name)
    }
  },
  draft_numbers(state) {
    return state.draft_numbers
  },
  draft_no(state) {
    return (type_slug) => {
      return state.draft_numbers[type_slug] || 1
    }
  },
  user_key(state) {
    return state.meta.repository.user_key || ""
  },
  initialized(state) {
    return state.initialized
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
  domain_title(state) {
    return state.domain.title
  },
  type_name(state) {
    return slug => {
      return state.entry_types.get(slug).title
    }
  },
  domain_of_type(state) {
    return slug => {
      return ld.filter(state.domains, domain => domain.value === state.entry_types.get(slug).domain)[0]
    }
  },
  domains(state) {
    return state.domains
  },
  domain_options(state) {
    return object_list2options(state.domains, TITLE)
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
