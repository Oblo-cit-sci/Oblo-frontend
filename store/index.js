let default_user_data = {
  global_role: "visitor",
};

export const state = () => ({
  logged_in: false,
  user_data: default_user_data,
  // comes by init
  initialized: false,
  available_entries: {}, // types for creation
  tags: {}, // initially just the licci tree
  codes: {}
});

function extract_liccis(tree) {
  let liccis = []
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

export const mutations = {
  init(state, data) {
    console.log("store init");
    //console.log(data);

    state.tags = data.licciTree;
    state.codes.liccis = extract_liccis(data.licciTree);
    //console.log(state.codes);
    for (let entry of data.entryTemplates) { // originally from available_create_entries
      state.available_entries[entry.slug] = entry
    }
    state.initialized = true;
    //console.log("available entries", state.available_entries);
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
  }
};
