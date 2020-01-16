import {
  ENTRIES_ALL_ENTRIES_OF_TYPE,
  ENTRIES_GET_ENTRY,
  ENTRIES_HAS_ENTRY,
  ENTRIES_SAVE_CHILD_N_REF,
  ENTRIES_SAVE_ENTRY, ENTRIES_SET_ENTRY_VALUE,
  ENTRIES_VALUE, ENTRYTYPES_TYPE, ENTRYTYPES_TYPENAME, UPDATE_DRAFT_NUMBERS
} from "./store_consts";
import {loc_prepend, loc_remove_last, pack_value} from "./aspect";
import {ENTRY} from "./consts";
import {get_update_draft_no, set_titleAspect} from "./entry";

const FileSaver = require('file-saver');
const ld = require("lodash")

export function export_data(data, filename) {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    {type: "text/json;charset=utf-8"});
  FileSaver.saveAs(blob, filename);
}


function update_new_entries(orig_new_entries, additional_entries) {
  for(let etype in additional_entries) {
    if(orig_new_entries.hasOwnProperty(etype)) {
      orig_new_entries[etype] += additional_entries[etype]
    } else {
      orig_new_entries[etype] = additional_entries[etype]
    }
  }
}

export function merge_imported_entries(store, entries) {
  let merge = []
  let context_entries = {}
  let new_entries = []

  for (let entry of entries) {
    //console.log(entry)
    if (entry.refs.parent !== null) {
      context_entries[entry.uuid] = entry
    } else {
      merge.push(entry)
    }
  }
  for (let entry of merge) {
    //let all_children_uuid = rec_children_uuids(entry, context)
    if (store.getters[ENTRIES_HAS_ENTRY](entry.uuid)) {
      console.log("needs merger", entry.title)
      // let additional_entries =
      Array.prototype.push.apply(new_entries, recursive_merge(store, entry, context_entries))
      // console.log("needs merger", entry.title)
      let additional_entries = recursive_merge(store, entry, context_entries)
      update_new_entries(new_entries_by_types,additional_entries)
    } else {
      console.log("straight import ", entry.title)
      // todo make straight
      Array.prototype.push.apply(new_entries, recursive_straight_insert(store, entry, context_entries))
      // let additional_entries = recursive_straight_insert(store, entry, context_entries)
      // console.log("straight import ", entry.title)
      let additional_entries = recursive_straight_insert(store, entry, context_entries)
      update_new_entries(new_entries_by_types,additional_entries)
    }
  }
  store.commit(UPDATE_DRAFT_NUMBERS, new_entries)
  return new_entries
}

function recursive_merge(store, entry, entry_dict) {
  console.log("rec-merge", entry.title)
  let new_entries = []
  //console.log("rec-merge", entry.title)
  if (store.getters[ENTRIES_HAS_ENTRY](entry.uuid)) {
    const store_entry = store.getters[ENTRIES_GET_ENTRY](entry.uuid)
    const child_uuids = entry.refs.children
    // console.log("#kids", Object.keys(child_uuids).length)
    for (let child_uuid in child_uuids) {
      const child_entry = get_entry_from_dict(child_uuid, entry_dict)
      if (store_entry.refs.children.hasOwnProperty(child_uuid)) {
        // merge, with message
        // console.log("..kid exists in store entry")
        //debugger
        // let additional_entries =
        Array.prototype.push.apply(new_entries, recursive_merge(store, child_entry, entry_dict))
        // update_new_entries(new_entries,additional_entries)
      } else {
        // console.log("..adding kid to store entry")
        const entry_type = store.getters[ENTRYTYPES_TYPE](child_entry.type_slug)
        new_entries.push(child_entry)
        // new_entries[entry_type.slug] = (new_entries[entry_type.slug] || 0) + 1
        //debugger
        const child_aspect_loc = entry.refs.children[child_uuid]
        let aspect_loc_destination = loc_prepend(ENTRY, store_entry.uuid, child_aspect_loc)
        const store_elist_aspect = loc_remove_last(aspect_loc_destination)
        const store_elist_val = ld.cloneDeep(store.getters[ENTRIES_VALUE](store_elist_aspect))

        store_elist_val.value.push(child_uuid)

        aspect_loc_destination[aspect_loc_destination.length - 1][1] = store_elist_val.value.length
        // todo actually check on all children as well....

        const all_type_entries = store.getters[ENTRIES_ALL_ENTRIES_OF_TYPE](child_entry.type_slug)
        if (ld.find(all_type_entries, e => e.title === child_entry.title)) {
          const draft_no = get_update_draft_no(store, child_entry.type_slug)

          child_entry.title = entry_type.title + " " + draft_no
          set_titleAspect(store, entry)
        }

        store.dispatch(ENTRIES_SAVE_CHILD_N_REF, {
          uuid: entry.uuid,
          child: child_entry,
          aspect_loc: aspect_loc_destination
        })
        store.dispatch(ENTRIES_SET_ENTRY_VALUE, {
          aspect_loc: store_elist_aspect,
          value: store_elist_val
        })
        // TODO straight import the kids?
        Array.prototype.push.apply(new_entries, recursive_straight_insert(store, child_entry, entry_dict))
        //let msg = child_entry.title + " merged into " + entry.title
      }
    }
  } else {
    console.log("recursive merge called on a non existing entry. calling straight import")
    return recursive_straight_insert(store, entry, entry_dict)
  }
  return new_entries
}

function get_entry_from_dict(uuid, entry_dict) {
  if (entry_dict.hasOwnProperty(uuid)) {
    return entry_dict[uuid]
  } else {
    console.log("Recursive children function. Entry lists child uuid that is not contained in the dictionary", uuid)
    return null
  }
}

function recursive_straight_insert(store, entry, entry_dict) {
  console.log("rec-straight", entry.title)
  let new_entries = []
  if (store.getters[ENTRIES_HAS_ENTRY](entry.uuid)) {
    // todo we could also go to merge...
    console.log(`Recursive straight import failed for ${entry.title}. Aborting for all children`)
    return []
  }
  const entry_type = store.getters[ENTRYTYPES_TYPE](entry.type_slug)

  if(entry_type) {
    store.commit(ENTRIES_SAVE_ENTRY, entry)
    new_entries.push(entry)
    for (let child_uuid in entry.refs.children) {
      const child_entry = get_entry_from_dict(child_uuid, entry_dict)
      if (child_entry) {
        Array.prototype.push.apply(new_entries, recursive_straight_insert(store, child_entry, entry_dict))
      }
    }
  } else {
    console.log("skipping entry for unknown type", entry.type_slug)
  }
  return new_entries
}
