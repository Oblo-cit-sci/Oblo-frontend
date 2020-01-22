import {
  ENTRIES_ALL_ENTRIES_ARRAY,
  ENTRIES_SAVE_ENTRY,
  ENTRIES_SET_ENTRY_VALUE,
  ENTRIES_VALUE,
} from "./store_consts";
import {ENTRYTYPES_HAS_TYPE, ENTRYTYPES_TYPES} from "~/lib/store_consts";
import {ASPECT, ENTRY, ENTRY_INDEX, VALUE} from "~/lib/consts";
import {loc_append, loc_prepend, pack_value, unpack} from "~/lib/aspect";
import {full_name} from "~/lib/entry";
import {entries_map, get_entries_of_type} from "~/lib/entry_collections";

const ld = require("lodash")

export function fix_add_licci_domain(store) {
  // console.log("fix_add_licci_domain")
  const entries = store.getters[ENTRIES_ALL_ENTRIES_ARRAY]()
  let count = 0
  for (let e of entries) {
    if (!e.domain) {
      e.domain = "licci"
      count += 1
      store.commit(ENTRIES_SAVE_ENTRY, e)
    }
  }
  // console.log(count, "entries fixed")
}

export function find_orhpans(store) {
  const entries = store.getters[ENTRIES_ALL_ENTRIES_ARRAY]()
  const e_map = ld.keyBy(entries, e => e.uuid)
  // const all_uuids = ld.map(entries, e => e.uuid)
  const to_find_uuids = ld.map(entries, e => e.uuid)
  // console.log("len entries", to_find_uuids.length)
  for (let e of entries) {
    if (!store.getters[ENTRYTYPES_HAS_TYPE](e.type_slug)) {
      console.log("skipping", e.title, "unkonwn slug", e.type_slug)
      continue
    }
    const entrylist_locs = store.getters["entrytypes/get_entrylist_aspect_locs"](e.type_slug)

    for (let elist_loc of entrylist_locs) {
      // console.log("loc", elist_loc[0][1])
      let value = store.getters[ENTRIES_VALUE](loc_prepend("entry", e.uuid, elist_loc))[VALUE]
      for (let uuid of value) {
        ld.remove(to_find_uuids, u => u === uuid)
      }
    }
  }
  console.log("number of orphans", to_find_uuids.length)
  for (let uuid of to_find_uuids) {
    if (e_map[uuid].status !== "orphan")
      store.commit("entries/set_entry_status", {uuid: uuid, status: "orphan"})
  }
  return to_find_uuids
}


export function fix_0_16_multi_select_errors(store) {
  /*
  a lot of problems with affected species and direction of change values
   */
  const entries = store.getters[ENTRIES_ALL_ENTRIES_ARRAY]()
  const e_map = entries_map(entries)

  const failed = check_all_values_basic_sanity(entries)
  for (let uuid__res of failed) {
    const entry_loc = [[ENTRY, uuid__res[0]]]
    const e = e_map[uuid__res[0]]
    console.log(e.app_version)
    console.log(uuid__res[1])
    try {
      for (let [val_name, value] of Object.entries(uuid__res[1].values)) {
        if (val_name === "Affected species") {
          const aspect_loc = loc_append(entry_loc, ASPECT, "Affected species")
          const value = pack_value([])
          console.log("fixx", value)
          store.dispatch(ENTRIES_SET_ENTRY_VALUE, {
            aspect_loc,
            value: value
          })
          console.log("fixed", val_name)
        }
      }
    } catch (err) {
      console.log("problem fixing", uuid__res[1])
    }
  }

}

export function fix_check_entrylist_references(store, with_fix = false) {
  /*
    the same as AnalysisHelper.py:check_entrylist_references
   */
  const entries = store.getters[ENTRIES_ALL_ENTRIES_ARRAY]()
  const e_map = ld.keyBy(entries, e => e.uuid)

  for (let e of entries) {
    console.log(full_name(store, e))
    if (!store.getters[ENTRYTYPES_HAS_TYPE](e.type_slug)) {
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

const temp_value_mapping = {
  VillageID: "Village id"
}


export function fix_broken_aspect_value_structure(store) {
  const types = store.getters[ENTRYTYPES_TYPES]
  for (let type_slug in types) {
    if (type_slug !== "village") {
      continue
    }
    const entries = get_entries_of_type(store, type_slug)
    console.log(type_slug, entries.length)
    for (let e of entries) {
      aspect_add_remove(e, types[type_slug])
    }
  }
}


export function verify_value(value, aspect) {
  console.log(value, aspect)
}

export function aspect_add_remove(entry, e_type) {
  const values = entry.aspects_values
  const aspects = e_type.content.aspects
  const aspects_map = ld.keyBy(aspects, a => a.name)

  const values_names = Object.keys(values)
  const aspects_names = Object.keys(aspects_map)
  const outdated_vals = ld.difference(values_names, aspects_names)
  const missing_vals = ld.difference(aspects_names, values_names)
  console.log("--------")
  console.log("in vals: now redundant", outdated_vals)
  console.log("in aspect: missing in vals", missing_vals)

  for (let [orig_name, new_name] of Object.entries(temp_value_mapping)) {
    console.log(orig_name, new_name)
    if (outdated_vals.includes(orig_name) && missing_vals.includes(new_name)) {
      verify_value(values[orig_name], aspects_map[new_name])
    }
  }
}

const OK = 0
const ERROR = 1
const FAIL = 2

const re_uuid = new RegExp('[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}')

export function check_str_is_uuid(val) {
  return re_uuid.test(val)
}

export function basic_value_sanity_check(value_name, packed_value) {
  /*
  name
  status
  [msg] for errors
  type: guessed type: number, string, entrylist, multiselect, list, composite
   */
  if (!packed_value.hasOwnProperty(VALUE)) {
    return {msg: "missing value", status: ERROR, packed_value: packed_value}
  } else {
    const i_value = unpack(packed_value)
    switch (typeof (i_value)) {
      case "number":
        return {name: value_name, status: OK, type: "number", val: i_value}
      case "string":
        return {name: value_name, status: OK, type: "string", val: i_value}
      case "object":
        if (ld.isArray(i_value)) {
          const results = []

          const is_uuid = check_str_is_uuid(i_value[0])
          if (is_uuid) {
            return {name: value_name, status: OK, type: "entrylist"}
          }
          if (ld.every(i_value, val => typeof val === "string")) {
            // probably a multi-select
            return {
              name: value_name,
              status: OK,
              items: results,
              type: "multiselect"
            }
          }
          for (let i in i_value) {
            const item_value = i_value[i]
            results.push(basic_value_sanity_check(i, item_value))
          }
          const has_error = ld.some(results, r => r.status === ERROR)
          // console.log(name, has_error)
          const status = has_error ? ERROR : OK
          return {
            name: value_name,
            status: status,
            items: results,
            type: "list"
          }
        } else {
          if (i_value === null) {
            return {
              name: value_name,
              status: OK,
              items: [],
            }
          }
          // composite
          const results = []
          for (let [component_name, comp_val] of Object.entries(i_value)) {
            results.push(basic_value_sanity_check(component_name, comp_val))
          }
          const has_error = ld.some(results, r => r.status === ERROR)
          const status = has_error ? ERROR : OK
          return {
            name: value_name,
            status: status,
            items: results,
            type: "composite"
          }
        }

      default:
        console.log("strange inner value", i_value, typeof (i_value))
        return {name: name, status: ERROR}
    }
  }
}

export function check_all_values_basic_sanity(entries) {
  /**
   * check if all values have the proper value structure
   * returns array of [uuid, result:obj]
   * result has keys:
   *  status: OK | ERROR | FAIL
   *  msg, when error
   *
   */
    //
  const results = {}
  for (let e of entries) {
    const values = e.aspects_values
    // console.log(values)
    const e_results = {status: OK, values: {}}
    for (let [name, value] of Object.entries(values)) {
      // console.log("***", name, value)
      const res = basic_value_sanity_check(name, value)
      if (res === undefined || res.status === undefined) {
        // console.log(name, value)
        // console.log(res)
        e_results.values[name] = {name: name, status: FAIL}
      } else if (res.status === ERROR) {
        e_results.values[name] = res
      }
    }
    if (!ld.isEmpty(e_results.values)) {
      e_results.status = ERROR
    }

    results[e.uuid] = e_results
  }
  return ld.filter(Object.entries(results), ([uuid, res]) => res.status === ERROR)
}
