/*
  this is for the own entries
 */

export const state = () => ({
  //
  timeline_entries: [],
  // todo, for now we download all own entries
  own_entries: [],
  own_entries2: new Map(),
  fetched_entries: {},
});

export const mutations = {
  add_timeline_entries(state, entries) {
    state.timeline_entries = entries;
  },
  set_own_entries(state, own_entries) {
    state.own_entries = own_entries;
  },
  save_entry(state, entry) {
    state.own_entries2.set(entry.local_id, entry)
  },
};
