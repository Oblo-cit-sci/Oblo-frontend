import {
  ENTRIES_GET_ENTRY,
  ENTRIES_HAS_ENTRY,
  ENTRIES_SAVE_CHILD_N_REF,
  ENTRIES_SAVE_ENTRY, ENTRIES_SET_ENTRY_VALUE,
  ENTRIES_VALUE
} from "./store_consts";
import {loc_prepend, loc_remove_last, pack_value} from "./aspect";
import {ENTRY} from "./consts";

const FileSaver = require('file-saver');


export function export_data(data, filename) {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    {type: "text/json;charset=utf-8"});
  FileSaver.saveAs(blob, filename);
}

/*
function rec_children_uuids(entry, dict) {
  let all_children_uuids = []
  for(let child_uuid in entry.refs.children){
    console.log(child_uuid)
    all_children_uuids.push(child_uuid)
    if(dict.hasOwnProperty(child_uuid)) {
      const child_entry = dict[child_uuid]
      all_children_uuids = all_children_uuids.concat(rec_children_uuids(child_entry, dict))
    } else {
      console.log("Recursive children function. Entry lists child uuid that is not contained in the dictionary")
    }
  }
  return all_children_uuids
}
 */

export function merge_imported_entries(store, entries) {
  let merge = []
  let context_entries = {}
  for (let entry of entries) {
    //console.log(entry)
    let etype = store.getters.entry_type(entry.type_slug)
    //if(etype.)
    if (entry.refs.parent !== null) {
      context_entries[entry.uuid] = entry
    } else {
      merge.push(entry)
    }
  }

  // todo
  for (let entry of merge) {
    //let all_children_uuid = rec_children_uuids(entry, context)
    if (store.getters[ENTRIES_HAS_ENTRY](entry.uuid)) {
      console.log("needs merger", entry.title)
      recursive_merge(store, entry, context_entries)
    } else {
      console.log("straight import ", entry.title)
      recursive_straight_insert(store, entry, context_entries)
    }
  }
}

function recursive_merge(store, entry, entry_dict) {
  if (store.getters[ENTRIES_HAS_ENTRY](entry.uuid)) {
    const store_entry = store.getters[ENTRIES_GET_ENTRY](entry.uuid)
    const child_uuids = entry.refs.children
    for (let child_uuid in child_uuids) {
      const child_entry = get_entry_from_dict(child_uuid, entry_dict)
      if (store_entry.refs.children.hasOwnProperty(child_uuid)) {
        // merge, with message
        recursive_merge(store, store_entry, entry_dict)
      } else {
        const child_aspect_loc = entry.refs.children[child_uuid]
        let aspect_loc_destination = loc_prepend(ENTRY, store_entry.uuid, child_aspect_loc)
        const store_elist_aspect = loc_remove_last(aspect_loc_destination)
        const store_elist_val = store.getters[ENTRIES_VALUE](store_elist_aspect)
        aspect_loc_destination[aspect_loc_destination.length - 1][1] = store_elist_val.value.length
        store_elist_val.value.push(child_uuid)
        // todo actually check on all children as well....
        store.dispatch(ENTRIES_SAVE_CHILD_N_REF, {
          uuid: entry.uuid,
          child: child_entry,
          aspect_loc: aspect_loc_destination
        })
        store.dispatch(ENTRIES_SET_ENTRY_VALUE, {
          aspect_loc: store_elist_aspect,
          value: store_elist_val
        })
      }
    }
  }
}

  function get_entry_from_dict(uuid, entry_dict) {
    if (entry_dict.hasOwnProperty(uuid)) {
      return entry_dict[uuid]
    } else {
      console.log("Recursive children function. Entry lists child uuid that is not contained in the dictionary")
      return null
    }
  }

  function recursive_straight_insert(store, entry, entry_dict) {
    if (store.getters[ENTRIES_HAS_ENTRY](entry.uuid)) {
      // todo we could also go to merge...
      console.log(`Recursive straight import failed for ${entry.title}. Aborting for all children`)
      return
    }
    store.commit(ENTRIES_SAVE_ENTRY, entry)
    console.log("inserted", entry.title)
    for (let child_uuid in entry.refs.children) {
      const child_entry = get_entry_from_dict(child_uuid)
      if (child_entry) {
        recursive_straight_insert(store, child_entry, entry_dict)
      }
    }
  }
