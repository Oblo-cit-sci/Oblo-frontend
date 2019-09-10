/*
  this is for the own entries
 */
import {ASPECT, COMPONENT, DRAFT, ENTRY, INDEX} from "../lib/consts";

import {ASPECT, COLLECT, DRAFT, ENTRY, INDEX} from "../lib/consts";
import {pack_value} from "../lib/aspect";

const ld = require("lodash")


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
  },
  save_entry(state, entry) {
    state.entries.set(entry.uuid, entry)
  },
  set_downladed(state, uuid) {
    let entry = state.entries.get(uuid)
    entry.downloads = entry.version
  },
  delete_single_entry(state, uuid) {
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
  delete_ref_child(state, {uuid, child_uuid}) {
    state.entries.get(uuid).refs.children.delete(child_uuid)
  },
  set_ref_parent(state, {uuid, ref}) {
    state.entries.get(uuid).refs.parent = ref
  },
  clear(state) {
    state.entries.clear()
    state.timeline_entries = []
  },
  update(state) {
    state.entries = new Map(state.entries.entries())
  },
  _set_entry_value(state, {aspect_loc, value}) {
    let select = null
    const final_loc = ld.last(aspect_loc)
    for (let loc of aspect_loc) {
      console.log("set", loc, select)
      if(loc === final_loc) {
        break
      } else if (loc[0] === ENTRY) {
        select = state.entries.get(loc[1]).aspects_values
      } else if(loc[0] === ASPECT){
        select = select[loc[1]]
      } else if(loc[0] === COMPONENT){
        select = select[loc[1]]
      } else {
        console.log("ERR", loc)
      }
    }

    if (final_loc[0] === ASPECT) {
      //select.set(inal_loc[1]) = value
      if (!select.hasOwnProperty(final_loc[1])) {
        console.log("error setting value", aspect_loc, loc)
      }
      select[final_loc[1]] = value
    } else if (final_loc[0] === COMPONENT) {
      select[final_loc[1]] = value
    }

    /*
        } else { // INDEX
          // push new value
          if (select.value.length === final_loc[1]) {
            // todo here could be a check if loc1 is length
            select.value.push(value)
          } else {
            select.value[final_loc[0]] = value
          }
        }
        */
  }
  // this is a duplicate from entry... the whole navigation part...
  /*set_entry_value(state, {uuid, aspect_loc, value}) {
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
  } */
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
      //console.log("entries get_entry", state.entries, uuid)
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
  entry(state) {
    return (uuid) => {
      //console.log("getter called")
      return state.entries.get(uuid)
    }
  },
  value(state) {
    return(aspect_loc) => {
      let select = null
      console.log("value?", aspect_loc)
      for (let loc of aspect_loc) {
        if (loc[0] === ENTRY) {
          select = state.entries.get(loc[1]).aspects_values
        } else if(loc[0] === ASPECT) {
          select = select[loc[1]]

        } else if(loc[0] === COMPONENT) {
          select = select.value[loc[1]]
        } else if(loc[0] === INDEX) {
          select = select.value[loc[1]]
        }
        //console.log("se--l", select)
      }
      console.log("res", select)
      return select
    }
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
  get_entry_value(state, getters) {
    // entry parameter: another hack that shouldnt be there. during the creation, the entry is not in the store yet.
    //
    return ({uuid, aspect_loc, entry}) => {
      //console.log(uuid, aspect_loc, entry)
      if (!entry) {
        //console.log("getting entry from the store")
        entry = getters.get_entry(uuid)
      }
      let select = entry.aspects_values
      for (let loc of aspect_loc) {
        switch (loc[0]) {
          case ENTRY:
            let parent_uuid = entry.refs.parent.uuid
            entry = getters.get_entry(parent_uuid)
            //console.log("parent", entry.title)
            select = entry.aspects_values
            break
          case ASPECT:
            select = select[loc[1]]
            break
          case INDEX:
            select = select.value[parseInt(loc[1])]
            break
          case COLLECT:
            if(select.value.constructor !== Array) {
              console.log("aspect-loc COLLECT(_) only runs over arrays")
              return undefined
            } else {
              // SHOULD BE THE FINAL
              return select.value.map(el => {
                //console.log("el", el, el.value[parseInt(loc[1])])
                return {value: el.value[parseInt(loc[1])].value}
              })
            }
          default:
            select = select.value[loc[1]]
        }
        if (!select) {
          console.log("error getting value", aspect_loc, loc)
        }
        //console.log("new select", select)
      }
      return select.value
    }
  }
}

export const actions = {
  delete_entry(context, uuid) {
    console.log("action delete")
  },
  set_entry_value({commit}, data) {
    commit("_set_entry_value", data)
    commit("update")
  add_child(context, uuid_n_aspect_loc_n_child) {
    context.commit("set_entry_value", uuid_n_aspect_loc_n_child)
    context.commit("add_ref_child", uuid_n_aspect_loc_n_child)
  },
  delete_entry(context, uuid) {
    //console.log("delete entry-...")
    const entry = context.state.entries.get(uuid)
    if (entry) {
      // TODO just TEMP, for easier testing
      context.commit("delete_single_entry", uuid)

      for (let child_uuid in entry.refs.children) {
        context.commit("delete_single_entry", child_uuid)
      }

      if (entry.refs.parent) {
        const parent = entry.refs.parent
        let parent_no_index = JSON.parse(JSON.stringify(parent))

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
        }
      }
    } else {
      console.log("store: entries DELETE tries to delete some entry that doesnt exist!")
    }
  }
}
