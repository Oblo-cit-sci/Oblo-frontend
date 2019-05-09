let default_user_data = {
  global_role: "visitor",
  registered_name: "visitor", // TODO should also retrieve that... with a number index
  // https://stackoverflow.com/questions/1253499/simple-calculations-for-working-with-lat-lon-km-distance
  // of 1 degree will result in error of around 50km per coordinate -0.5, +0.5 degree change around the real location
  location_error: 2,
  defaultLicense: "CC0", // should come from the server
  defaultPrivacy: "public"
};


export const state = () => ({
  logged_in: false,
  user_data: default_user_data,
  // comes by init
  initialized: false,
  // TODO use DICT!!!
  entry_types: new Map(), // types for creation
  //entry_type_slug_index_dict: {}, // cuz we dont have Map, which would be ideal...
  tags: {}, // initially just the licci tree
  codes: {},
  related_users: [],
  // recent
  recent_entries: [],
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


// maps suck in Vue

function array_to_val__id_dict(data, key_val) {
  let res = {};
  for (let index in data) {
    let value = data[index];
    res[value[key_val]] = parseInt(index);
  }
  return res;
}

export const mutations = {
  init(state, data) {
    //console.log("store init");
    state.codes.liccis = data.licciTree;
    state.codes.liccis_flat = extract_liccis(data.licciTree);
    state.codes.licenses = data.licenses;
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
  login(state, user_data) {
    state.logged_in = true;
    state.user_data = user_data;
  },
  logout(state) {
    state.logged_in = false;
    state.user_data = default_user_data;
  },
  set_user_data(state, user_data) {
    state.user_data = user_data;
  },

  entrytype(state, newtype) {
    state.available_entries.push(newtype);
    //state.entry_type_slug_index_dict[newtype.slug] = state.available_entries.length - 1;
  },
  set_entries(state, entries) {
    console.log("setting entries");
    state.recent_entries = entries;
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
    return state.user_data.global_role === "visitor"
  },
  name(state) {
    return state.user_data.registered_name;
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
  get_aspect(state, getters) {
    return (type_slug, aspect_name) => {
      return ld.find(state.entry_types.get(type_slug).content.aspects, (a) => a.name === aspect_name);
    };
  }
};

