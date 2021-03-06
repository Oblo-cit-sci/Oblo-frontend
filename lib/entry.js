import {
  COMPOSITE,
  EDIT,
  LIST,
  STR,
  TITLE_ASPECT
} from "./consts"
import {aspect_default_value, attr} from "./aspect";

import {CREATOR} from "~/lib/actors";

const jp = require('jsonpath')
import {JSONPath} from 'jsonpath-plus';

// todo should come from nuxt.config.js : config.aspect_select_debug
const DEBUG = false
const DEBUG_SIMPLE = true

const DEV_TRIGGER_EXCEPTION = false

const ld = require("lodash")
const uuidv4 = require('uuid/v4')


// todo, this should be in the store. but it needs to work for both getting and setting
export function select_aspect_loc(entries_mod, aspect_loc, skip_final = false, select = null, debug = DEBUG) {
  if (debug || true) {
    console.log("select_aspect_loc", aspect_loc)
  }
  // console.log("select_aspect_loc", aspect_loc)
  // console.log("-->", aspect_loc, aspect_loc[0][0], aspect_loc[1][0], aspect_loc[1][0] === "NEW_LOC_FORMAT")
  // console.log("check new format...", aspect_loc,ld.get(aspect_loc, "0.0"), (ld.get(aspect_loc, "1.0")))
  if (ld.get(aspect_loc, "0.0") === "NEW_LOC_FORMAT") {
    // console.log("new loc 00")
    console.warn("entry.js.select_aspect_loc: PROPER aspect-loc fix NOT YET IMPLEMENTED")
    return temp_direct_select(entries_mod, aspect_loc[0][1])
  }
  if (ld.get(aspect_loc, "1.0") === "NEW_LOC_FORMAT") {
    // console.log("passloc check if edit", aspect_loc)
    var entry_e = "$uuid"
    if (aspect_loc[0][0] === EDIT) {
      entry_e = "$edit"
    }
    const pass_loc = `${entry_e}.${aspect_loc[0][1]}.${aspect_loc[1][1]}`
    // console.log("---> pass_loc", pass_loc)
    // console.log(aspect_loc, aspect_loc.slice(1), aspect_loc.slice(2))
    return temp_direct_select(entries_mod, pass_loc)
  }

  console.warn("DEPRECATED ASPECT_LOC ACCESS", aspect_loc)
  console.trace()
}



export function current_user_is_owner(store, entry) {
  return ld.find(entry.actors.owners, (o) => o.registered_name === store.getters.user.registered_name)
}


export function prepare_for_submission(entry) {
  const mod_entry = ld.cloneDeep(entry)
  delete mod_entry.app_version
  delete mod_entry.creation_ts
  delete mod_entry.last_edit_ts
  delete mod_entry.downloads
  delete mod_entry.local
  delete mod_entry.status
  delete mod_entry.version
  return mod_entry
}

export function get_creator(entry) {
  return ld.get(entry.actors.filter(er => er.role === CREATOR), "0.actor", null)
}

function slice_until(parts, index) {
  return ld.slice(parts, 0, index)
}

function slice_from(parts, index) {
  return ld.slice(parts, index)
}

function join_until(parts, index) {
  return slice_until(parts, index).join(".")
}

function join_from(parts, index) {
  return slice_from(parts, index).join(".")
}

function cut_from(loc, index) {
  return join_from(loc.split("."), index)
}

export function recursive_select(select, loc) {
  // console.log("r", select, loc)
  if (!loc)
    return select
  const parts = loc.split(".")
  const split_symbols = ["$map", "$-1"]
  const split_index = ld.findIndex(parts, p => split_symbols.includes(p))
  if (split_index !== -1) {
    const split_symbol = parts[split_index]
    if (split_symbol === "$map") {
      const inter_loc = join_until(parts, split_index)
      const post_loc = join_from(parts, split_index + 1)
      // console.log("inter_loc", inter_loc)
      const inter_val = ld.get(select, inter_loc)
      // console.log("inter_val", inter_val)
      return ld.map(inter_val, v => recursive_select(v, post_loc))
    } else if (split_symbol === "$-1") {
      const inter_loc = join_until(parts, split_index)
      const post_loc = join_from(parts, split_index + 1)
      const inter_val = ld.get(select, inter_loc)
      // console.log("inter_loc", inter_loc)
      // console.log("inter_val", inter_val)
      // console.log("post_loc", post_loc)
      const next_val = inter_val[inter_val.length - 1]
      return recursive_select(next_val, post_loc)
    }
  } else {
    return ld.get(select, loc)
  }
}

export function direct_select(select, loc) {
  return recursive_select(select, loc)
}

export function temp_direct_select(entries_mod, loc) {
  // console.log("entry.temp_direct_select", loc)
  const parts = loc.split(".")
  const pre_setter = ["$edit", "$uuid"]
  let select = null
  if (pre_setter.includes(parts[0])) {
    const pre_set = parts[0]
    if (pre_set === "$edit") {
      select = ld.get(entries_mod, "edit.values")
      loc = cut_from(loc, 2)
    } else if (pre_set === "$uuid") {
      select = ld.get(entries_mod, "entries")
      if (select)
        select = select.get(parts[1]).values
      loc = cut_from(loc, 2)
    }
  }
  // console.log("select",select, loc)
  if (!select)
    return null
  return recursive_select(select, loc)
  // console.log("ress", result)
}

function resolve_from_value(aspect_value, tag) {
  const value = jp.value(aspect_value, tag.subpath)
  if (value) {
    return {name: tag.name, value}
  }
}

function resolve_tag(aspect_value, aspect) {
  // console.log("resolve_tag", aspect_value, aspect.name)
  let res = []
  const tag = attr(aspect).tag
  if (tag) {
    // debugger
    if (Array.isArray(tag)) {
      for (let tag_option of tag) {
        const tag_val = resolve_from_value(aspect_value, tag_option)
        if (tag_val) {
          res.push(tag_val)
          break
        }
      }
    } else {
      const tag_val = resolve_from_value(aspect_value, tag)
      if (tag_val)
        res.push(tag_val)
    }
  }
  if (aspect.type === COMPOSITE) {
    for (let component of aspect.components) {
      res = res.concat(resolve_tag(aspect_value.value[component.name], component))
    }
  } else if (aspect.type === LIST) {
    for (let list_item of aspect_value.value) {
      res = res.concat(resolve_tag(list_item, aspect.list_items))
    }
  }
  return res
}

export function resolve_tags(entry, template) {
  // console.log(entry, template)
  let tags = []
  for (let aspect of template.aspects) {
    tags = tags.concat(resolve_tag(entry.values[aspect.name], aspect))
  }
  // use set and turn to arrays in the end, to prevent duplicates
  const groups = tags.reduce((groups, tag_val) => {
    if (!groups.hasOwnProperty(tag_val.name)) {
      groups[tag_val.name] = new Set()
    }
    groups[tag_val.name].add(tag_val.value)
    return groups
  }, {})

  return ld.mapValues(groups, tags => Array.from(tags))
}

export function new_value_getter(values, location) {
  // console.log(values, location)
  // console.log(location)
  try {
    // console.log(JSONPath(location, values))
    return JSONPath(location, values)[0]
  } catch (e) {
    console.error("JSONPath failed", values, location)
  }
  try {
    // console.log(jp.value(values, location))
    return jp.value(values, location)
  } catch (e) {
    console.error("jp failed", values, location)
    console.error("will return null")
    // debugger
    return undefined
  }
}

