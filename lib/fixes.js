import {ENTRIES_ALL_ENTRIES_ARRAY, ENTRIES_SAVE_ENTRY, ENTRIES_VALUE, ENTRYTYPES_TYPE} from "./store_consts";
import {ENTRYTYPES_HAS_TYPE} from "~/lib/store_consts";
import {ENTRY_INDEX, VALUE} from "~/lib/consts";
import {loc_append, loc_prepend} from "~/lib/aspect";
import {full_name} from "~/lib/entry";

const ld = require("lodash")

export function fix_add_licci_domain(store) {
  console.log("fix_add_licci_domain")
  const entries = store.getters[ENTRIES_ALL_ENTRIES_ARRAY]()
  let count = 0
  for (let e of entries) {
    if (!e.domain) {
      e.domain = "licci"
      count += 1
      store.commit(ENTRIES_SAVE_ENTRY, e)
    }
  }
  console.log(count, "entries fixed")
}

export function fix_check_entrylist_references(store, with_fix = false) {
  /*
    the same as AnalysisHelper.py:check_entrylist_references
   */
  // debugger
  const entries = store.getters[ENTRIES_ALL_ENTRIES_ARRAY]()
  const e_map = ld.keyBy(entries, e => e.uuid)

  for (let e of entries) {
    console.log(full_name(store, e))
    if (!store.getters[ENTRYTYPES_HAS_TYPE]) {
      console.log("skipping", e.title, "unkonwn slug", e.type_slug)
      continue
    }
    // const e_type = store.getters[ENTRYTYPES_TYPE](e.type_slug)
    const entrylist_locs = store.getters["entrytypes/get_entrylist_aspect_locs"](e.type_slug)
    if (entrylist_locs.length > 0) {
      // console.log("all elist locs", entrylist_locs)
      const ref_kids = e.refs.children
      for (let elist_loc of entrylist_locs) {
        console.log("loc", elist_loc[0][1])
        let value = store.getters[ENTRIES_VALUE](loc_prepend("entry", e.uuid, elist_loc))[VALUE]
        console.log(value)
        let uuids = ld.filter(value, uuid => e_map.hasOwnProperty(uuid))
        console.log(uuids.length)
        console.log(uuids)
        if (value.length !== uuids.length) {
          // todo no!
          console.log("kicked out:", ld.filter(uuids, uuid => !value.hasOwnProperty(uuid)))
        }
        for (let index in uuids) {
          const uuid = uuids[index]
          const ext_loc = loc_append(elist_loc, ENTRY_INDEX, parseInt(index))
          const child_parent_ref_loc = e_map[uuid].refs.parent.aspect_loc

          const ref_diff = [ld.isEqual(ext_loc, ref_kids[uuid]), ld.isEqual(ext_loc, child_parent_ref_loc)]
          console.log("a=r?", ref_diff[0])
          // CHECK REF; then kids PARENT REF
          if (!ld.isEqual(ext_loc, ref_kids[uuid])) {
            console.log(ext_loc, ref_kids[uuid])
            // if (with_fix)
            //   ref_kids[uuid] = ext_loc
          }

          console.log("a=p?", ref_diff[1])
          // console.log("a", ld.last(ext_loc)[1], "c", ld.last(ref_kids[uuid])[1], "p", ld.last(child_parent_ref_loc)[1])
          if (!ld.isEqual(ext_loc, child_parent_ref_loc)) {
            console.log(ext_loc, child_parent_ref_loc)
            // if (with_fix)
            //   e_map[uuid].refs.parent.aspect_loc = ext_loc
          }
          if (!ref_diff[0] || !ref_diff[1]) {
            console.log("FIX")
            store.commit("entries/fix_refs", {
              parent_uuid: e.uuid,
              child_uuid: uuid,
              aspect_loc: ext_loc
            })
          }
        }
      }
    }
  }
}
