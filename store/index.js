export const state = () => ({
  // comes by init
  initialized: false,
  // TODO use DICT!!!
  entry_types: new Map(), // types for creation
  tags: {}, // initially just the licci tree
  codes: {},
  // recent
  fetched_entries: {},
  // momentary
  snackbar: {message: "", status: "ok"},
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
    //console.log("init", data.codes)
    state.codes = {...data.codes}
    state.codes.liccis_flat = extract_liccis(data.codes.liccis);

    state.entry_types = new Map(ld.map(data.entryTemplates, (e) => {
      return [e.slug, e]
    }));

    state.related_users = data.related_users;

    //state.entry_type_slug_index_dict = array_to_val__id_dict(data.entryTemplates, "slug");
    state.initialized = true;
  },
  set_related_users(state, related_users) {
    state.related_users = related_users
  },
  entrytype(state, newtype) {
    state.entry_types[newtype.type_slug] = newtype;
    //state.entry_type_slug_index_dict[newtype.slug] = state.available_entries.length - 1;
  },
  // should be set with {message: str, status: ok|error}
  set_snackbar(state, snackbar) {
    state.snackbar = snackbar
  },
  add_fetched_entry(state, entry) {
    state.fetched_entries[entry.uuid] = entry
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

