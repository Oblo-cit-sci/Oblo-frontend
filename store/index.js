let default_user_data = {
  global_role: "visitor",
};

export const state = () => ({
  logged_in: false,
  user_data: default_user_data,
  available_entries: {} // for creation
});

export const mutations = {
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
  available_create_entries(state, entry_templates) {
    state.available_entries = {};
    for(let entry of entry_templates) {
      state.available_entries[entry.slug] = entry
    }
  }
};
