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
  available_entries: [], // types for creation
  tags: {}, // initially just the licci tree
  codes: {},
  related_users: [],
  drafts: [],
  // recent
  recent_entries: [],
  fetched_entries: {},
  // momentary
  snackbar: {message: "", status: "ok"},
  // selected entry type (for creation)
  selected_creation_type: undefined // will be the object from `available_entries`
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

/*
// maps suck in Vue

function array_to_map(data, key_val) {
  let res = new Map();
  for(let val of data) {
    res[val[key_val]] = val;
  }
  return res; //new Map(ld.chain(data).keyBy(key_val).value());
}
*/

export const mutations = {
  init(state, data) {
    //console.log("store init");
    state.tags = data.licciTree;
    state.codes.liccis = extract_liccis(data.licciTree);
    state.codes.licenses = data.licenses;
    state.available_entries = data.entryTemplates;

    console.log(state.available_entries);
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
  // not used atm: from call /available_create_entries, but maybe after init to update the
  available_entries(state, entryTemplates) {
    state.available_entries = {};
    for (let entry of entryTemplates) {
      state.available_entries[entry.slug] = entry
    }
  },
  set_entries(state, entries) {
    console.log("setting entries");
    state.recent_entries = entries;
  },
  select_creation_type(state, entry_type) {
    state.selected_creation_type = entry_type;
  },
  create_draft(state, draft_data){
    state.drafts.push(draft_data);
  },
  save_draft(state, draft_data) {
    state.drafts[draft_data.draft_id] = draft_data;
  },
  remove_draft(state, draft_id) {
    state.drats = ld.filter(state.drafts, (d) => d.draft_id !== draft_id);
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
    console.log("visitor check");
    return state.user_data.global_role === "visitor"
  }
};

