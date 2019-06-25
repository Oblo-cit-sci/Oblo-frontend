/*
  this is for the own entries
 */

import {create_title} from "../lib/entry";

const ld = require("lodash")

export const state = () => ({
  //
  draft_no: 0,
  timeline_entries: [],
  // todo, for now we download all own entries
  entries: new Map(),
  fetched_entries: {},
});

export const mutations = {
  add_timeline_entries(state, entries) {
    state.timeline_entries = entries;
  },
  set_entries(state, entries) {
    // todo, needs to converted to a map (from array)
    //console.log("setting own entries with", entries)
    /*
    entries.forEach((e) => {
      e.aspects_values = e.content.aspects
      e.local_id = e.uuid
      state.entries.set(e.uuid, e)
    })
     */
  },
  create(state, entry) {
    //console.log(entry)
    state.entries.set(entry.uuid,entry)
    state.draft_no++;
  },
  save_entry(state, entry) {
    state.entries.set(entry.uuid, entry)
  },
  set_downladed(state, uuid) {
    let entry = state.entries.get(uuid)
    entry.downloads = entry.version
  },
  remove_entry(state, local_id) {
    state.entries.delete(local_id)
  },
  set_downloaded(state, local_id) {
    let e = state.entries.get(local_id)
    console.log("DL ", e, local_id)
    e.downloaded_version = e.version
  },
  add_fetched_entry(state, entry) {
    state.fetched_entries[entry.uuid] = entry
    //console.log(state.fetched_entries)
  },
  add_ref_child(state, {uuid, ref_data}) {
    console.log("store entries: adding ref to ", uuid, ref_data)
    state.entries.get(uuid).refs.children.push(ref_data)
  },
  set_ref_parent(state, {uuid, ref}) {
    state.entries.get(uuid).refs.parent = ref
  },
  clear(state) {
    state.entries.clear()
    state.timeline_entries = []
  }
}

export const getters = {
  get_entry(state, getters) {
    return (uuid) => {
      return state.entries.get(uuid)
    };
  },
  get_children(state, getters) {
    return (entry) => {
      return ld.map(entry.refs.children, ref => state.entries.get(ref.uuid))
    };
  }
}
