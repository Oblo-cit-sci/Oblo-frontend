/*
  this is for the own entries
 */
import {ASPECT, COMPONENT, DRAFT, EDIT, ENTRY, INDEX, PRIVATE_LOCAL, VIEW} from "../lib/consts";
import {get_entry_titleAspect, get_proper_mode, select_aspect_loc} from "../lib/entry";
import {aspect_loc_str2arr, loc_prepend} from "../lib/aspect";
import {GET_ENTRY} from "../lib/store_consts";

import Vue from "vue"

const ld = require("lodash")

const DELETE_ENTRY = "delete_entry"
const DELETE_EDIT_ENTRY = "delete_edit_entry"
const DELETE_REF_CHILD = "delete_ref_child"

export const state = () => ({
  timeline_entries: [],
  entries: new Map(),
  edit: null
});

// commmit
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
  save_entry(state, entry) {
    state.entries.set(entry.uuid, entry)
  },
  delete_edit_entry(state) {
    state.edit = null
  },
  set_downladed(state, uuid) {
    let entry = state.entries.get(uuid)
    entry.downloads = entry.version
  },
  delete_entry(state, uuid) { // DELETE_ENTRY
    state.entries.delete(uuid)
  },
  set_downloaded(state, local_id) {
    let e = state.entries.get(local_id)
    //console.log("DL ", e, local_id)
    e.downloaded_version = e.version
  },
  add_edit_ref_child(state, {aspect_loc, child_uuid}) {
    state.edit.refs.children[child_uuid] = aspect_loc
  },
  add_ref_child(state, {uuid, child_uuid, aspect_loc}) {
    state.entries.get(uuid).refs.children[child_uuid] = aspect_loc
  },
  delete_edit_ref_child(state, child_uuid) {
    delete state.edit.refs.children[child_uuid]
  },
  // todo, shouldnt be needed
  set_ref_parent(state, {uuid, ref}) {
    state.entries.get(uuid).refs.parent = ref
  },
  clear(state) {
    state.entries.clear()
    state.edit = null
    state.timeline_entries = []
  },
  _set_entry_value(state, {aspect_loc, value}) {
    //console.log("set entry value", aspect_loc, value)
    let select = select_aspect_loc(state, aspect_loc, true)
    const final_loc = ld.last(aspect_loc)
    //console.log("final,", final_loc, "select", select, "value", value)
    if (final_loc[0] === ASPECT) {
      select[final_loc[1]] = value
    } else if (final_loc[0] === COMPONENT) {
      select.value[final_loc[1]] = value
    } else if (final_loc[0] === INDEX) {
      Vue.set(select.value,final_loc[1], value)
    } else {
      console.log("ERROR store.entries. final location", final_loc)
    }
    //console.log("result", select, state)
  },
  _remove_entry_value_index(state, aspect_loc) {
    let select = select_aspect_loc(state, aspect_loc, true)
    const final_loc = ld.last(aspect_loc)
    ld.remove(select.value, (_, index) => index === final_loc[1])
  },
  set_edit_dirty(state) {
    state.edit.local.dirty = true
  },
  set_edit_clean(state) { // ENTRIES_SET_EDIT_CLEAN
    if (state.edit) {
      state.edit.local.dirty = false
    }
  },
  // todo renmae, update entry
  _save_entry(state, uuid) {
    let entry = state.entries.get(uuid)
    entry.version += 1
    entry.local.prev = null
  },
  set_edit(state, uuid) {
    state.edit = state.entries.get(uuid)
  },  // todo template for all kinds of computed meta-aspects
  update_title(state, {uuid, title}) {
    state.entries.get(uuid).title = title
  }
}


export const getters = {
  all_entries(state) {
    return state.entries.values()
  },
  all_entries_array(state) {
    //console.log(state.entries)
    return () => {
      return Array.from(state.entries.values())
    }
  },
  get_edit(state) {
    return state.edit
  },
  edit_uuid(state) {
    if (state.edit)
      return state.edit.uuid
    else return ""
  },
  get_status(state) {
    return (uuid = state.edit) => {
      return state.entries.get(uuid).status
    }
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
  has_entry(state) { // ENTRIES_GET_ENTRY
    return (uuid) => {
      return state.entries.has(uuid)
    };
  },
  get_entry(state) {
    return (uuid) => {
      return state.entries.get(uuid)
    }
  },
  get_children(state) {
    return (entry) => {
      return ld.map(entry.refs.children, ref => state.entries.get(ref.uuid))
    }
  },
  get_own_entries(state) {
    // todo
  },
  user_rights(state, getters, rootState, rootGetters) { // ENTRIES_USER_RIGHTS
    return (user_uid = rootGetters["user/user_uid"], uuid = state.edit.uuid) => {
      const entry = getters[GET_ENTRY](uuid)
      if (ld.find(entry.actors.owners, owner => owner.uid === user_uid)) {
        return EDIT
      } else {
        return VIEW
      }
    }
  },
  get_parent(state, getters) { // ENTRIES_GET_PARENT
    return entry => {
      //console.log("getter", entry, entry.refs)
      return getters.get_entry(entry.refs.parent.uuid)
    }
  },
  value(state, getters) {
    return (aspect_loc) => {
      if (aspect_loc[0][0] !== ENTRY) {
        aspect_loc = ld.concat([[EDIT, getters.edit_uuid]], aspect_loc)
      }
      return select_aspect_loc(state, aspect_loc)
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
  },
  get_type_of_entry(state, getters) {
    return uuid => {
      let entry = getters.get_entry(uuid)
      if (!entry) {
        console.log("No entry for uuid", uuid)
        return null
      }
      return getters.get_entry_type(entry.type_slug)
    }
  },
  get_entry_type(state, getters, root_state) {
    return slug => {
      const entry_type = root_state.entry_types.get(slug)
      if (!entry_type) {
        console.log("No entry type for slug", slug)
        return null
      } else {
        return entry_type
      }
    }
  },
  // todo: get edit title, but will be simpler...?
  get_entry_title: function (state, getters) {
    return (uuid = state.edit.uuid) => {
      const entry = getters.get_entry(uuid)
      const type = getters.get_entry_type(entry.type_slug)
      let titleAspect = get_entry_titleAspect(type)
      if (!titleAspect) {
        console.log("entries.get_entry_title TODO, use default title for type")
        return ""
      }
      // todo maybe it would be cleaner to add "entry "+uuid , so that  aspect_loc_str2arr/is wrapped around
      const title = select_aspect_loc(state, loc_prepend(ENTRY, uuid, aspect_loc_str2arr(titleAspect)))
      //console.log("get_entry_title", title)
      if (title.value)
        return title.value
      else {
        console.log("entries.get_entry_title TODO, use default title for type")
        return entry.title
      }
    }
  },
  get_proper_mode(state, getters) {
    // when entry is private local, always > edit
    // when owner, draft > edit
    // otherwise > view
    return (uuid = state.edit.uuid) => {
      const entry = getters.get_entry(uuid)
      return get_proper_mode(entry)
    }
  },
  get_search_entries: function (state) {
    return (state.entries)
  }
}

// dispatch
export const actions = {
  set_entry_value(context, data) {
    context.commit("_set_entry_value", data)
    context.commit("set_edit_dirty")
    // context.commit("update")
  },
  save_child_n_ref(context, {uuid, child, aspect_loc, child_uuid}) { // ENTRIES_SAVE_CHILD_N_REF
    if (!uuid) {
      uuid = context.getters.edit_uuid
    }
    context.dispatch("save_entry", uuid)
    context.commit("save_entry", child)
    context.commit("add_ref_child", {uuid, aspect_loc, child_uuid})
  },
  /*add_child(context, uuid_n_aspect_loc_n_child) {
    console.log("store.entries: add child")
    context.commit("set_entry_value", uuid_n_aspect_loc_n_child)
    context.commit("add_ref_child", uuid_n_aspect_loc_n_child)
  },*/
  cancel_entry_edit({commit}, uuid) {
    commit("cancel_entry_edit", uuid)
  },
  // rename to save edit entry
  // todo: purpose/name: update meta or something like that?
  save_entry(context, uuid = context.state.edit.uuid) {
    const entry_title = context.getters.get_entry_title(uuid)
    context.commit("update_title", {uuid, title: entry_title})
  },
  set_edit(context, uuid) {
    context.commit("set_edit", uuid)
  },
  delete_ref_child(context, {uuid, child_uuid}) { // DELETE_REF_CHILD
    let aspect_loc = context.state.entries.get(uuid).refs.children[child_uuid]
    delete context.state.entries.get(uuid).refs.children[child_uuid]
    context.commit("_remove_entry_value_index", ld.concat([[ENTRY, uuid]], aspect_loc))
  },
  delete_entry(context, uuid) { // ENTRIES_DELETE_ENTRY
    const entry = context.state.entries.get(uuid)
    if (entry) {
      // TODO just TEMP, for easier testing

      for (let child_uuid in entry.refs.children) {
        context.dispatch(DELETE_ENTRY, child_uuid)
      }

      if (entry.refs.parent) {
        const parent = entry.refs.parent
        context.dispatch(DELETE_REF_CHILD, {uuid: parent.uuid, child_uuid: uuid})
      }

      context.commit(DELETE_ENTRY, uuid)
      context.commit(DELETE_EDIT_ENTRY)


    } else {
      console.log("store: entries DELETE tries to delete some entry that doesnt exist!")
    }
  }
}
