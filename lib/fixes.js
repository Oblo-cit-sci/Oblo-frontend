import {
  ENTRYTYPES_TYPE,
} from "./store_consts";
import {ENTRYTYPES_HAS_TYPE, ENTRYTYPES_TYPES} from "~/lib/store_consts";
import {ASPECT, ENTRY, ENTRY_INDEX, ENTRYLIST, GLOBAL, INT, SELECT, VALUE} from "~/lib/consts";
import {aspect_raw_default_value, loc_append, loc_prepend, pack_value, unpack} from "~/lib/aspect";
import {full_name} from "~/lib/entry";
import {entries_map, get_entries_of_type} from "~/lib/entry_collections";
import {aspect_by_name} from "~/lib/entrytype";
import {
    ENTRIES_ALL_ENTRIES_ARRAY,
    ENTRIES_GET_ENTRY,
    ENTRIES_SAVE_ENTRY, ENTRIES_SET_ENTRY_STATUS,
    ENTRIES_SET_ENTRY_VALUE,
    ENTRIES_VALUE
} from "~/store/entries";

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
    } else {
      if (store.getters[ENTRYTYPES_TYPE](e.type_slug).rules.context === GLOBAL) {
        ld.remove(to_find_uuids, u => u === e.uuid)
      }
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
      store.commit(ENTRIES_SET_ENTRY_STATUS, {uuid: uuid, status: "orphan"})
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

  find_orhpans(store)

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
        // console.log("loc", elist_loc[0][1])
        const complete_aspect_loc = loc_prepend("entry", e.uuid, elist_loc)
        let value = store.getters[ENTRIES_VALUE](complete_aspect_loc)[VALUE]
        // console.log(value)
        let uuids = ld.filter(value, uuid => e_map.hasOwnProperty(uuid))
        console.log(uuids.length)
        // console.log(uuids)
        if (value.length !== uuids.length) {
          // todo no!
          console.log("kicked out:", ld.filter(value, uuid => !uuids.includes(uuid)))
        }
        store.dispatch(ENTRIES_SET_ENTRY_VALUE, {
          aspect_loc: complete_aspect_loc,
          value: pack_value(uuids)
        })
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


const value_mappings = {
  site: {
    "SiteID": "Site ID",
    "Calendar": "Seasonal Calendar",
  },
  adaptation_and_coping_strategy: {
    "Adaption measure title": "Adaptation measure title",
  },
  village: {
    "VillageID": "Village id",
    "Same accessibility of the market during the seasons": "Same accessibility of the market town during the seasons",
    "Market, easy season": "Market town, easy season"
  }
}

const add_default = {
  adaptation_and_coping_strategy: [
    "Non LICCI drivers"
  ],
  village: [
    "Staple crop"
  ]
}

// [ "IPLC", "Officially recognized territory of IPLC", "Wealth items", "Site LICCIS"]
// [ "IPLC name", "Protected area in site", "Recognized territory in Site", "Assets with a market value", "Observation & LICCI", "Adaptation and coping strategies", "Crop diversity contribution", "Crop diversity systems", "Survey LICCIS", "Survey LACCIS", "Knowledgeable groups and activities"]

export function fix_broken_aspect_value_structure(entry, e_type, store) {

  const outdated_missing = aspect_add_remove(entry, e_type)
  const outdated = outdated_missing[0]
  const missing = outdated_missing[1]


  if (outdated.length !== 0 && missing.length !== 0) {
    console.log(e_type.title, ":", entry.title)
    console.log("in vals  : now redundant  ", outdated)
    console.log("in aspect: missing in vals", missing)
  } else {
    // console.log(e_type.title, ":", entry.title, "OK")
    return {}
  }

  const outdated_remaining = ld.clone(outdated)
  const missing_remaining = ld.clone(missing)

  const result_values = {}
  const mapping = value_mappings[e_type.slug]
  if (!mapping) {
    console.log("no mapping for type", e_type.slug)
    return
  }
  for (let [orig_name, new_name] of Object.entries(mapping)) {
    if (outdated.includes(orig_name) && missing.includes(new_name)) {
      // verify_value(values[orig_name], missing[new_name])
      const value = entry.values[orig_name]
      const aspect = aspect_by_name(e_type, new_name)
      const result = check_value_matches_aspect(orig_name, value, aspect, store)
      if (result.status === OK) {
        result_values[new_name] = result.value
        ld.remove(outdated_remaining, a => a === orig_name)
        ld.remove(missing_remaining, a => a === new_name)
      } else {
        console.log("cannot convert", orig_name, new_name)
      }
    }
  }

  const direct_add = add_default[e_type.slug]
  for (let new_name of direct_add) {
    const aspect = aspect_by_name(e_type, new_name)
    const value = aspect_raw_default_value(aspect)
    ld.remove(missing_remaining, a => a === new_name)
  }

  console.log("> in vals  :   now redundant", outdated_remaining)
  console.log("> in aspect: missing in vals", missing_remaining)

  if (!ld.isEmpty(result_values)) {
    console.log(result_values)
  }
  return result_values
}

export function all_fix_broken_aspect_value_structure(store) {
  const types = store.getters[ENTRYTYPES_TYPES]
  for (let type_slug in types) {
    const entries = get_entries_of_type(store, type_slug)
    // console.log(type_slug, entries.length)
    for (let e of entries) {
      fix_broken_aspect_value_structure(e, types[type_slug], store)
    }
  }
}

export function all_kick_redundent_values(store, only_types) {
  const types = store.getters[ENTRYTYPES_TYPES]
  for (let type_slug in types) {
    const entries = get_entries_of_type(store, type_slug)
    if (!only_types.includes(type_slug))
      continue
    for (let e of entries) {
      console.log("cleaning", e.title)
      const new_e = kick_redundent_values(e, types[type_slug], store)
      store.commit(ENTRIES_SAVE_ENTRY, new_e)
    }
  }
}

export function kick_redundent_values(entry, e_type) {
  const outdated = aspect_add_remove(entry, e_type)[0]
  const new_entry = ld.cloneDeep(entry)
  for (let aspect_name of outdated) {
    delete new_entry.values[aspect_name]
  }
  return new_entry
}

export function check_value_matches_aspect(value_name, value, aspect, store) {
  const status = basic_value_sanity_check(value_name, value)
  console.log(value_name, status.type, aspect.type)
  // guessed type: number, string, entrylist, multiselect, list, composite
  const aspect_type = aspect.type
  switch (aspect_type) {
    case "str": {
      if (status.type === "string") {
        return {"status": OK, "value": status.value}
      } else {
        console.log("not taking sting, but it probably would, ...")
        return {"status": ERROR}
      }
    }
    case INT:
      if (status.type === "number") {
        return {"status": OK, "value": parseInt(status.value)}
      }
      if (status.type === "string") {
        try {
          const int_val = parseInt(status.value)
          return {"status": OK, "value": int_val}
        } catch {
          return {"status": ERROR}
        }
      }
      console.log("unhandled situation for", aspect_type, "and status", status)
      return {"status": ERROR}
    case SELECT:
      if ([SELECT, "string"].includes(status.type)) {
        const options = aspect.items
        if (typeof options === "string" && options[0] === "*") {
          console.log("TODO: options of", aspect.name, "are code:", options, "cannot be checked atm...")
          return {"status": ERROR}
        }
        if (options.includes(status.value)) {
          return {status: OK, value: status.value}
        }
      }
      console.log("unhandled situation for", aspect_type, "and status", status)
      return {status: ERROR}
    case ENTRYLIST:
      const e_list_type = aspect.items
      if (status.value.length === 0) {
        return {status: OK, value: []}
      }
      const first_e = store.getters[ENTRIES_GET_ENTRY](status.value[0])
      const first_e_type_slug = first_e.type_slug
      if (!store.getters[ENTRYTYPES_HAS_TYPE](first_e_type_slug)) {
        return {status: ERROR, value: [], msg: "type of orig entrylist entries dont exist", first_e_type_slug}
      } else {
        return {status: OK, value: status.value}
      }
    // console.log("unhandled situation for",aspect_type,"and status", status)
    // return {status: ERROR}
    default:
      console.log("unhandeled aspect type:", aspect.name, aspect.type)
      return {status: ERROR}
  }
}

export function aspect_add_remove(entry, e_type) {
  const values = entry.values
  const aspects = e_type.aspects
  const aspects_map = ld.keyBy(aspects, a => a.name)

  const values_names = Object.keys(values)
  const aspects_names = Object.keys(aspects_map)
  const outdated_vals = ld.difference(values_names, aspects_names)
  const missing_vals = ld.difference(aspects_names, values_names)
  // console.log("--------")
  // console.log("in vals: now redundant", outdated_vals)
  // console.log("in aspect: missing in vals", missing_vals)

  return [outdated_vals, missing_vals]
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
        return {name: value_name, status: OK, type: "number", value: i_value}
      case "string":
        return {name: value_name, status: OK, type: "string", value: i_value}
      case "object":
        if (ld.isArray(i_value)) {
          const results = []

          const is_uuid = check_str_is_uuid(i_value[0])
          if (is_uuid) {
            return {name: value_name, status: OK, type: ENTRYLIST, value: i_value}
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
    const values = e.values
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

/// TODO:
/*
  get straight the entrylists and the 2 related refs, children, parent, index

 */

export function all_straighten_entry_lists_references(store) {
  const entries = store.getters[ENTRIES_ALL_ENTRIES_ARRAY]()
  const e_map = ld.keyBy(entries, e => e.uuid)
  for (let e of entries) {
    if (!store.getters[ENTRYTYPES_HAS_TYPE](e.type_slug)) {
      console.log("skipping", e.title, "unkonwn slug", e.type_slug)
      continue
    } else {
      if (store.getters[ENTRYTYPES_TYPE](e.type_slug).rules.context === GLOBAL) {
        ld.remove(to_find_uuids, u => u === e.uuid)
      }
    }
    const entrylist_locs = store.getters["entrytypes/get_entrylist_aspect_locs"](e.type_slug)

    for (let elist_loc of entrylist_locs) {
      // console.log("loc", elist_loc[0][1])
      let value = store.getters[ENTRIES_VALUE](loc_prepend("entry", e.uuid, elist_loc))[VALUE]
      for (let uuid of value) {

      }
    }
  }
}
