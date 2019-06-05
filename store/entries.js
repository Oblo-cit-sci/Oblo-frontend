/*
  this is for the own entries
 */

export const state = () => ({
  //
  timeline_entries: [],
  // todo, for now we download all own entries
  own_entries: new Map(),
  fetched_entries: {},
});

export const mutations = {
  add_timeline_entries(state, entries) {
    state.timeline_entries = entries;
  },
  set_own_entries(state, own_entries) {
    // todo, needs to converted to a map (from array)
    console.log("setting own entries with", own_entries)
    own_entries.forEach((e) => {
      e.local_id = e.uuid
      state.own_entries.set(e.uuid, e)
    })
  },
  save_entry(state, entry) {
    state.own_entries.set(entry.local_id, entry)
  },
  remove_entry(state, entry_id) {
    state.own_entries.delete(entry_id)
  }
};
