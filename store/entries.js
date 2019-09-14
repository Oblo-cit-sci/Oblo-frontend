/*
  this is for the own entries
 */
import {ASPECT, COLLECT, COMPONENT, DRAFT, ENTRY, INDEX, LINKED_INDEX, PARENT} from "../lib/consts";
import {complete_aspect_loc} from "../lib/client";
import {get_uuid, select_aspect_loc} from "../lib/entry";


const ld = require("lodash")

const DELETE_ENTRY = "delete_entry"

export const state = () => ({
  timeline_entries: [],
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
    state.entries.set(entry.uuid, entry)
    state.edit = entry
  },
  save_entry(state, entry) {
    state.entries.set(entry.uuid, entry)
  },
  _cancel_entry_edit(state, uuid) {
    state.edit.delete(uuid)
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
    //console.log("DL ", e, local_id)
    e.downloaded_version = e.version
  },
  add_ref_child(state, {uuid, aspect_loc, child_uuid}) {
    //console.log("add_ref_child", uuid, aspect_loc, child_uuid)
    let kids = state.entries.get(uuid).refs.children
    let refs = kids[child_uuid] || []
    kids[child_uuid] = ld.concat(refs, [aspect_loc])
  },
  delete_ref_child(state, {uuid, child_uuid}, c) {
    state.entries.get(uuid).refs.children[child_uuid].forEach(ref => {
      let aspect_loc = complete_aspect_loc(uuid, ref)
      console.log("delete_ref_child", aspect_loc)
      console.log(state)
      //let value = state.gettes.value(aspect_loc)
      //console.log("delete_ref_child.value", value)
      delete state.entries.get(uuid).refs.children[child_uuid]
    })
  },
  // todo, showldnt be needed
  set_ref_parent(state, {uuid, ref}) {
    state.entries.get(uuid).refs.parent = ref
  },
  clear(state) {
    state.entries.clear()
    state.timeline_entries = []
  },
  /*update(state, {uuid}) {
    state.entries = new Map(state.entries.entries())
    // TODO TEMP TO TEST EDIT
    console.log("UPDATE", state.entries.get(uuid), state.edit, state.entries.get(uuid).aspects_values.title.value)
    if(state.edit === null)
      state.edit = state.entries.get(uuid)
    else
      state.edit = null //
  },*/
  _set_entry_value(state, {aspect_loc, value}) {
    let select = select_aspect_loc(state.entries, aspect_loc, true)
    const final_loc = ld.last(aspect_loc)
    //console.log("final,", final_loc, "select", select)
    if (final_loc[0] === ASPECT) {
      select[final_loc[1]] = value
    } else if (final_loc[0] === COMPONENT) {
      select.value[final_loc[1]] = value
    } else if (final_loc[0] === INDEX) {
      select.value[final_loc[1]] = value
    } else {
      console.log("ERROR store.entries. final location", final_loc)
    }
  },
  set_dirty(state, uuid) {
    state.entries.get(uuid).local.dirty = true
  },
  set_clean(state, uuid) {
    state.entries.get(uuid).local.dirty = false
  },
  _save_entry(state, uuid) {
    let entry = state.entries.get(uuid)
    entry.version += 1
    entry.local.prev = null
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
  get_entry(state) {
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
  },
  value(state) {
    return (aspect_loc) => {
      let select = select_aspect_loc(state.entries, aspect_loc)
      //console.log("store.entries, value?", aspect_loc, "res:", select)
      return select
    }
  },
  delete_ref_value(state, {uuid, child_uuid}) {

  },
  get_recursive_entries(state, getters) {
    return uuid => {
      const entry = getters.get_entry(uuid)
      let entries = [entry]
      const child_keys = Object.keys(entry.refs.children)
      const child_entries_list = ld.map(child_keys, uuid => getters.get_recursive_entries(uuid))
      child_entries_list.forEach(ce_list => {
        ce_list.forEach(c_entry => {
          entries.push(c_entry)
        })
      })
      return entries
    }
  }
}

export const actions = {
  set_entry_value({commit}, data) {
    commit("_set_entry_value", data)
    commit("set_dirty", get_uuid(data.aspect_loc))
  },
  /*add_child(context, uuid_n_aspect_loc_n_child) {
    console.log("store.entries: add child")
    context.commit("set_entry_value", uuid_n_aspect_loc_n_child)
    context.commit("add_ref_child", uuid_n_aspect_loc_n_child)
  },*/
  cancel_entry_edit({commit}, uuid) {
    commit("cancel_entry_edit", uuid)

  },
  save_entry(context, uuid) {
    context.commit("_save_entry", uuid)
  },
  delete_entry(context, uuid) {
    console.log("store.entries.delete entry-...")
    const entry = context.state.entries.get(uuid)
    if (entry) {
      // TODO just TEMP, for easier testing
      context.commit(DELETE_ENTRY, uuid)

      for (let child_uuid in entry.refs.children) {
        context.commit(DELETE_ENTRY, child_uuid)
      }

      if (entry.refs.parent) {
        const parent = entry.refs.parent
        context.commit("delete_ref_child", {uuid: parent.uuid, child_uuid: uuid})
        console.log(context)
        //context.getters["value"]
        //context.commit("delete_ref_value", {uuid: parent.uuid, child_uuid: uuid})
      }
      //context.getters("value")
      /*let parent_no_index = JSON.parse(JSON.stringify(parent))

      if (ld.last(parent_no_index.aspect_loc)[0] === "index") {
        parent_no_index.aspect_loc.pop()
      }
      const value = context.getters.get_entry_value(parent_no_index)
      // ListOf
      if (Array.isArray(value)) {
        const filtered_value = value.filter(av => av !== uuid)
        context.commit("set_entry_value", {
          ...parent_no_index,
          value: pack_value(filtered_value)
        })

       */
    } else {
      console.log("store: entries DELETE tries to delete some entry that doesnt exist!")
    }
  }
}
