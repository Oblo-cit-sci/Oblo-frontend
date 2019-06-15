export const state = () => ({
  // comes by init
  initialized: false,
  //
  connected: false,
  dirty: false,
  entry_types: new Map(), // types for creation
  tags: {}, // initially just the licci tree
  codes: {},
  // recent
  //fetched_entries: {},
  // momentary
  snackbar: {message: "", status: "ok"},
  mapmode: {},
  global_ref: {} // the last draft/entry
  // selected entry type (for creation)
});

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
  return liccis;
}

const ld = require('lodash');


export const mutations = {
  init(state, data) {
    state.codes = {...data.codes}
    state.codes.liccis_flat = extract_liccis(data.codes.liccis);
    state.entry_types = new Map(ld.map(data.entryTemplates, (e) => {
      return [e.slug, e]
    }));
    state.related_users = data.related_users;
    //state.entry_type_slug_index_dict = array_to_val__id_dict(data.entryTemplates, "slug");
    state.initialized = true
  },
  set_related_users(state, related_users) {
    state.related_users = related_users
  },
  entrytype(state, newtype) {
    state.entry_types[newtype.type_slug] = newtype;
    //state.entry_type_slug_index_dict[newtype.slug] = state.available_entries.length - 1;
  },
  // should be set with {message: str, ok: boolean}
  set_snackbar(state, snackbar) {
    state.snackbar = snackbar
  },
  set_ok_snackbar(state, msg) {
    state.snackbar = {message: msg, ok: true}
  },
  set_error_snackbar(state, msg) {
    state.snackbar = {message: msg, ok: false}
  },
  connection(state, connected) {
    state.connected = connected
  },
  set_mapmode(state, mode) {
    state.mapmode = mode
  },
  set_global_ref(state, ref){
    state.global_ref = ref
  }
};

export const getters = {
  visitor(state) {
    //console.log("visitor check");
    return state.user.user_data.global_role === "visitor"
  },
  name(state) {
    return state.user.user_data.registered_name;
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
    return global_entry_types;
  },
  entry_type(state, getters) {
    return (type_slug) => {
      return state.entry_types.get(type_slug)
    };
  },
  get_aspect_index(state, getters) {
    return (type_slug, aspect_name) => {
      return ld.findIndex(state.entry_types.get(type_slug).content.aspects, (a) => a.name === aspect_name);
    };
  },
  get_aspect(state, getters) {
    return (type_slug, aspect_name) => {
      return ld.find(state.entry_types.get(type_slug).content.aspects, (a) => a.name === aspect_name);
    };
  }
};

export const actions = {
  test(context, val) {
    //console.log("text store action", context, val)
  }
}
