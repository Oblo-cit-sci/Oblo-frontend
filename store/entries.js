/*
  this is for the own entries
 */

export const state = () => ({
  //
  draft_no: 0,
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
    //console.log("setting own entries with", own_entries)
    own_entries.forEach((e) => {
      e.aspects_values = e.content.aspects
      e.local_id = e.uuid
      state.own_entries.set(e.uuid, e)
    })
  },
  create(state, entry) {
    console.log(entry)
    state.own_entries.set(entry.uuid,entry)
    state.draft_no++;
  },
  save_entry(state, entry) {
    state.own_entries.set(entry.local_id, entry)
  },
  remove_entry(state, local_id) {
    state.own_entries.delete(local_id)
  },
  set_downloaded(state, local_id) {
    let e = state.own_entries.get(local_id)
    console.log("DL ", e, local_id)
    e.downloaded_version = e.version
  },
  add_fetched_entry(state, entry) {
    state.fetched_entries[entry.uuid] = entry
    //console.log(state.fetched_entries)
  },
  add_ref_child(state, {local_id, ref_data}) {
    console.log("store entries: adding ref to ", local_id, ref_data)
    this.own_entries.get(local_id).children.push(ref_data)
  },
  clear(state) {
    state.own_entries.clear()
    state.fetched_entries = {}
    state.timeline_entries = []
  }
}

export const getters = {
  get_entry(state, getters) {
    return (local_id) => {
      return state.own_entries.get(local_id)
    };
  }
}
