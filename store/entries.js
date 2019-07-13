/*
  this is for the own entries
 */


import {ASPECT, DRAFT} from "../lib/consts";

const ld = require("lodash")

export const state = () => ({
  //
  timeline_entries: [],
  // todo, for now we download all own entries
  entries: new Map(),
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
    state.entries.set(entry.uuid, entry)
  },
  save_entry(state, entry) {
    state.entries.set(entry.uuid, entry)
  },
  set_downladed(state, uuid) {
    let entry = state.entries.get(uuid)
    entry.downloads = entry.version
  },
  delete_entry(state, uuid) {
    state.entries.delete(uuid)
  },
  set_downloaded(state, local_id) {
    let e = state.entries.get(local_id)
    console.log("DL ", e, local_id)
    e.downloaded_version = e.version
  },
  add_ref_child(state, {uuid, child_uuid, aspect_loc}) {
    let kids = state.entries.get(uuid).refs.children
    let refs = kids[child_uuid] || []
    kids[child_uuid] = ld.concat(refs, [aspect_loc])
  },
  delete_ref_child(state, {uuid, child_uuid}) {
    console.log("e.delete_ref_child", child_uuid)
    delete state.entries.get(uuid).refs.children[child_uuid]
  },
  set_ref_parent(state, {uuid, ref}) {
    state.entries.get(uuid).refs.parent = ref
  },
  clear(state) {
    state.entries.clear()
    state.timeline_entries = []
  },
  // this is a duplicate from entry... the whole navigation part...
  set_entry_value(state, {uuid, aspect_loc, value}) {
    let entry = state.entries.get(uuid)
    let select = entry.aspects_values
    const final_loc = aspect_loc.pop()
    for (let loc of aspect_loc) {
      if (loc[0] === ASPECT) {
        select = select[loc[1]]
        if (!select) {
          console.log("error setting value", aspect_loc, loc)
        }
      }
    }
    if (final_loc[0] === ASPECT) {
      //select.set(inal_loc[1]) = value
      if (!select.hasOwnProperty(final_loc[1])) {
        console.log("error setting value", aspect_loc, loc)
      }
      select[final_loc[1]] = value
    } else { // INDEX
      // push new value
      if (select.value.length === final_loc[1]) {
        // todo here could be a check if loc1 is length
        select.value.push(value)
      } else {
        select.value[final_loc[0]] = value
      }
    }
  }


}

export const getters = {
  all_entries(state, getters) {
    return state.entries.values()
  },
  all_drafts(state) {
    // as method prevents caching
    return () => {
      // todo fuck, how to run a filter over Map class
      let result = []
      for (let e of state.entries.values()) {
        if (e.status === DRAFT)
          result.push(e)
      }
      return result
    }
  },
  has_entry(state, getters) {
    return (uuid) => {
      return state.entries.has(uuid)
    };
  },
  get_entry(state, getters) {
    return (uuid) => {
      return state.entries.get(uuid)
    };
  },
  get_children(state, getters) {
    return (entry) => {
      return ld.map(entry.refs.children, ref => state.entries.get(ref.uuid))
    };
  },
  get_own_entries(state) {
    // todo
  }
}

export const actions = {
  delete_entry(state, uuid) {
    console.log("action delete")
  }
}
