/*
  this is for the own entries
 */
import {ASPECT, COLLECT, COMPONENT, DRAFT, EDIT, ENTRY, INDEX} from "../lib/consts";
import {get_entry_titleAspect, select_aspect_loc} from "../lib/entry";
import {aspect_loc_str2arr} from "../lib/aspect";
import {GET_ENTRY_TITLE} from "../lib/store_consts";


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
  create(state, entry) {
    state.entries.set(entry.uuid, entry)
  },
  save_entry(state, entry) {
    state.entries.set(entry.uuid, entry)
  },
  delete_edit_entry(state, uuid) {
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
  delete_edit_ref_child(state, child_uuid) {
    delete state.edit.refs.children[child_uuid]
  },
  // todo, showldnt be needed
  set_ref_parent(state, {uuid, ref}) {
    state.entries.get(uuid).refs.parent = ref
  },
  clear(state) {
    state.entries.clear()
    state.edit = null
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
    //console.log("set entry value", aspect_loc, value)
    let select = select_aspect_loc(state, aspect_loc, true)
    const final_loc = ld.last(aspect_loc)
    //console.log("final,", final_loc, "select", select, "value", value)
    if (final_loc[0] === ASPECT) {
      select[final_loc[1]] = value
    } else if (final_loc[0] === COMPONENT) {
      select.value[final_loc[1]] = value
    } else if (final_loc[0] === INDEX) {
      select.value[final_loc[1]] = value
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
  _save_entry(state, uuid) {
    let entry = state.entries.get(uuid)
    entry.version += 1
    entry.local.prev = null
  },
  update(state) {
    const a = state.edit
    state.edit.aspects_values = a.aspects_values
  },
  set_edit(state, uuid) {
    state.edit = state.entries.get(uuid)
  },
  save_edit(state) {
    if (state.edit) {
      state.entries.set(state.edit.uuid, state.edit)
    }
  },
  update_edit_title(state, title) {
    state.edit.title = title
  }
}


export const getters = {
  all_entries(state) {
    return state.entries.values()
  },
  all_entries_array(state) {
    return Array.from(state.entries.values())
  },
  edit_uuid(state) {
    if (state.edit)
      return state.edit.uuid
    else return ""
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
    };
  },
  get_children(state) {
    return (entry) => {
      return ld.map(entry.refs.children, ref => state.entries.get(ref.uuid))
    };
  },
  get_own_entries(state) {
    // todo
  },
  get_edit(state) {
    return state.edit
  },
  value(state) {
    return (aspect_loc) => {
      //console.log("value", aspect_loc)
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
  get_entry_title: function (state, getters) {
    return uuid => {
      const entry = getters.get_entry(uuid)
      const type = getters.get_entry_type(entry.type_slug)
      let titleAspect = get_entry_titleAspect(type)
      if (!titleAspect) {
        console.log("entries.get_entry_title TODO, use default title for type")
        return ""
      }
      const title = select_aspect_loc(state, ld.concat([[EDIT, uuid]], aspect_loc_str2arr(titleAspect)))
      if (title)
        return title.value
      else {
        console.log("entries.get_entry_title TODO, use default title for type")
        return ""
      }
    }
  },
  get_search_entries: function(state) {
    return(state.entries)
  }

}

// dispatch
export const actions = {
  set_entry_value(context, data) {
    context.commit("_set_entry_value", data)
    context.commit("set_edit_dirty")
    // context.commit("update")
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
  save_entry(context) {
    const entry_title = context.getters[GET_ENTRY_TITLE](context.state.edit.uuid)
    if (entry_title)
      context.commit("update_edit_title", entry_title)
    context.commit("save_edit")
  },
  set_edit(context, uuid) {
    context.commit("save_edit")
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
