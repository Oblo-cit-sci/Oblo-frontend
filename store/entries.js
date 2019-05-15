/*
  this is for the own entries
 */

export const state = () => ({
  // todo, for now we download all own entries
  own_entries: [],
  fetched_entries: {},
});

export const mutations = {
  set_own_entries(state, own_entries) {
    state.own_entries = own_entries;
  }
};
