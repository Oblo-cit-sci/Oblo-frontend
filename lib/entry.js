import {
  ASPECT,
  COLLECT,
  COLLECT_CLOSE,
  COMPONENT, COMPOSITE,
  DRAFT,
  EDIT,
  ENTRY,
  ENTRY_COLLECT,
  ENTRY_COLLECT_CLOSE,
  ENTRY_COLLECT_LINK,
  ENTRY_INDEX,
  ENTRY_LINK_FOLLOW,
  INDEX,
  LIST,
  META,
  PARENT,
  PRIVATE_LOCAL,
  REGULAR,
  REVIEW,
  STR,
  TITLE_ASPECT,
  VIEW
} from "./consts"
import {aspect_default_value, aspect_loc_str2arr, attr, pack_value} from "./aspect";

import {recursive_unpack, recursive_unpack2} from "./util";
import {user_ref} from "./actors";
import {CREATOR} from "~/lib/actors";

const jp = require('jsonpath')


// todo should come from nuxt.config.js : config.aspect_select_debug
const DEBUG = false
const DEBUG_SIMPLE = true

const DEV_TRIGGER_EXCEPTION = false

const ld = require("lodash")
const uuidv4 = require('uuid/v4')


// todo this can make use one of the more generic setter methods
export function set_titleAspect(store, entry) {
  const template = store.getters["templates/entry_type"](entry.template)
  let set_aspect = template.rules.hasOwnProperty("set_aspect") ? template.rules.set_aspect : true
  if (set_aspect) {
    const loc_arr = aspect_loc_str2arr(template.rules.titleAspect)
    let title_val = select_aspect_loc(null, loc_arr, false, entry.values)
    title_val.value = entry.title
  }
}

// todo, this should be in the store. but it needs to work for both getting and setting
export function select_aspect_loc(entries_mod, aspect_loc, skip_final = false, select = null, debug = DEBUG) {
  if (debug) {
    console.log("select_aspect_loc", aspect_loc)
  }
  // console.log("select_aspect_loc", aspect_loc)
  // console.log("-->", aspect_loc, aspect_loc[0][0], aspect_loc[1][0], aspect_loc[1][0] === "NEW_LOC_FORMAT")
  if (ld.get(aspect_loc, "0.0") === "NEW_LOC_FORMAT") {
    // console.log("new loc 00")
    console.warn("entry.js.select_aspect_loc: PROPER aspect-loc fix NOT YET IMPLEMENTED")
    return temp_direct_select(entries_mod, aspect_loc[0][1])
  }
  if (ld.get(aspect_loc, "1.0") === "NEW_LOC_FORMAT") {
    const pass_loc = `$uuid.${aspect_loc[0][1]}.${aspect_loc[1][1]}`
    // console.log("---> pass_loc", pass_loc)
    // console.log(aspect_loc, aspect_loc.slice(1), aspect_loc.slice(2))
    return temp_direct_select(entries_mod, pass_loc)
  }


  let pre_select = null
  //let select = null
  //console.log("select_aspect_loc", aspect_loc)
  const final_loc = ld.last(aspect_loc)

  let skip_collect = false
  let skip_entry_collect = false

  let entry_uuid = undefined
  let as_edit = false

  for (let loc of aspect_loc) {
    if (debug) {
      console.log("loc", loc)
    }
    if (select) {
      pre_select = select
    }
    try {
      //console.log("->", select, loc, "sc", skip_collect, "sec", skip_entry_collect)
      const A_TYPE = loc[0]
      const A_VALUE = loc[1]
      // ** CLOSE COLLECTORS
      if (skip_final && loc === final_loc) {
        break
      }
      if (skip_collect) {
        if (A_TYPE === COLLECT_CLOSE) {
          //console.log(COLLECT_CLOSE)
          skip_collect = false
        }
      } else if (skip_entry_collect) {
        if (A_TYPE === ENTRY_COLLECT_CLOSE) {
          //console.log(ENTRY_COLLECT_CLOSE)
          skip_entry_collect = false
        }
        // **
      } else if (A_TYPE === EDIT) {
        //console.log(EDIT, entries_mod)
        entry_uuid = entries_mod.edit.uuid
        select = entries_mod.edit.values
        as_edit = true
      } else if (A_TYPE === ENTRY) {
        entry_uuid = A_VALUE
        select = entries_mod.entries.get(A_VALUE).values
      } else if (A_TYPE === PARENT) {
        const number_of_levels = parseInt(A_VALUE)
        // start from the 1.
        // todo this is a getter, no?
        // todo this is also problematic for EDIT, it always needs the uuid
        let entry = entries_mod.entries.get(aspect_loc[0][1]) // this entry
        if (aspect_loc[0] === EDIT && !entry) {
          console.log("no entry in PARENT, probably due to edit as 1. entry")
        }
        if (number_of_levels) {
          for (let i = 0; i < number_of_levels; i++) {
            entry = entries_mod.entries.get(entry.entry_refs.parent.uuid)
          }
        } else { // A_VALUE is not a number.
          //console.log("access parent by slug",A_VALUE)
          //console.log(entry.title, entry, entry.template)
          while (entry.type_slug !== A_VALUE) {
            // check here if parent doesnt exists
            entry = entries_mod.entries.get(entry.entry_refs.parent.uuid)
            // console.log("checking type", entry.title, entry.template, A_VALUE, "?")
          }
        }
        select = entry.values
      } else if (A_TYPE === META) {
        if (as_edit) {
          select = entries_mod.edit[A_VALUE]
        } else {
          select = entries_mod.entries.get(entry_uuid)[A_VALUE]
        }
      } else if (A_TYPE === ASPECT) {
        select = select[A_VALUE]
      } else if (A_TYPE === COMPONENT) {
        select = select.value[A_VALUE]
      } else if (A_TYPE === INDEX) {
        // console.log(INDEX, select, loc)
        if (A_VALUE >= select.value.length) {
          console.log("lib.entry.value: index out of bounds", A_VALUE, "length:", select.value.length)
          return pack_value()
        }
        if (A_VALUE >= 0) {
          select = select.value[A_VALUE]
        } else { // python like access from the back
          if (Math.abs(A_VALUE) > select.value.length) {
            return pack_value()
          } else {
            select = select.value[select.value.length + A_VALUE]
          }
        }
      } else if (A_TYPE === ENTRY_INDEX) {
        select = entries_mod.entries.get(select.value[A_VALUE])
        if (!select) {
          console.log("lib.entry.value: no value at entry-index", A_VALUE)
          return pack_value(null)
        } else {
          select = select.values
        }
      } else if (loc[0] === COLLECT) {
        let collect_over_list = select.value
        if (debug) {
          console.log(COLLECT, " over list", collect_over_list)
        }
        // might be a list of basic types or a list of composite, check aspect_loc
        let reduced_loc = ld.takeWhile(ld.takeRightWhile(aspect_loc, al => {
            return al !== loc
          }
        ), al => {
          return al[0] !== COLLECT_CLOSE
        })
        if (debug) {
          console.log(COLLECT, "reduced_loc", reduced_loc)
        }
        if (reduced_loc.length === 0) {
          // TODO simple type, done? TEST
          return collect_over_list
        } else if (reduced_loc.length === 1) {
          let collected = ld.map(collect_over_list, comp => {
            return comp.value[reduced_loc[0][1]]
          })
          collected = ld.filter(collected, v => (!!v))
          //console.log(COLLECT, "collected", collected)
          select = {value: collected, list: true}
          //console.log("collected", select)
          skip_collect = true
        } else {
          // console.log("non-tested collect, larger aspect_loc")
          let collected = ld.map(collect_over_list, v => select_aspect_loc(entries_mod, reduced_loc, false, v))
          collected = ld.filter(collected, v => (!!v))
          select = {value: collected, list: true}
          skip_collect = true
          // select_aspect_loc(entries_mod, reduced_loc, false, select)
        }
      } else if (A_TYPE === ENTRY_COLLECT || A_TYPE === ENTRY_COLLECT_LINK) {
        /*
          [ ENTRY_COLLECT
          > ENTRY_COLLECT_LINK
         */
        //console.log(ENTRY_COLLECT, "!", select, aspect_loc)
        select = select[A_VALUE]
        let reduced_loc = ld.takeRightWhile(aspect_loc, al => {
          return al !== loc
        })
        reduced_loc = ld.takeWhile(reduced_loc, al => {
          return al[0] !== ENTRY_COLLECT_CLOSE
        })
        // console.log(ENTRY_COLLECT, "reduced_loc", reduced_loc)
        let collected = []
        // this turns list of entry-selects into entrylists, which are list of uuids.
        // todo lists of entry-selects can have unregular values, they should not be allowed or filtered out here
        const unpacked = recursive_unpack(select.value)
        console.log(unpacked === recursive_unpack2(select.value))

        unpacked.forEach(e_uuid => {
          // todo isnt this just the complete ... call
          let entry_loc = ld.concat([[ENTRY, e_uuid]], reduced_loc)
          let val = select_aspect_loc(entries_mod, entry_loc)
          //console.log(ENTRY_COLLECT, "e-val", val)
          // todo, check if required, maybe concat manages it
          if (val[LIST]) {
            if (A_TYPE === ENTRY_COLLECT_LINK) {
              // console.log(val)
              val.value = ld.map(val.value, v => {
                return {value: e_uuid, text: v.value}
              })
              // TODO: NOT TESTed
              val.value = ld.filter(val.value, v => v.value !== null)
              //console.log("<", val)
              collected = ld.concat(collected, val.value)
            } else {
              //console.log("adding val", val)
              const new_values = ld.map(val.value, v => {
                return v.value
              })
              collected = ld.concat(collected, new_values)
              //console.log("collected", collected)
            }
          } else {
            if (A_TYPE === ENTRY_COLLECT_LINK) {
              if (val.value) {
                // todo, shouldnt have a text?
                collected = ld.concat(collected, {value: e_uuid, text: val.value})
              }
            } else {
              collected = ld.concat(collected, val)
            }
          }
        })
        // console.log("collected", collected)
        skip_entry_collect = true
        select = pack_value(collected)
      } else if (A_TYPE === ENTRY_LINK_FOLLOW) {
        if (!select || !select.value) {
          return pack_value(null)
        } else {
          select = entries_mod.entries.get(select.value).values
        }
      } else {
        console.log("ERROR store.entries.  select ", select, "location", loc)
      }
    } catch (e) {
      console.log("entry.select_aspect_loc failed for select:", select, "with location:", loc, "aspect_loc", aspect_loc, "options", pre_select)
      if (process.env.NODE_ENV !== "production" && DEV_TRIGGER_EXCEPTION)
        throw "entry.select_aspect_loc failed for select:" + select + "with location:" + loc + "aspect_loc" + aspect_loc
      else
        return pack_value(null)
    }
    if (debug) {
      console.log("select", select)
    }
    if (!select) {
      console.log("SELECT failed for", "select:", select, loc, "options", pre_select, "aspect_loc", aspect_loc,)
      return undefined
    }
  }
  // console.log("returning", select)
  return select
}

export function entry_value_select(entry, aspect_loc) {
  if (DEBUG_SIMPLE) {
    console.log("select_aspect_loc", aspect_loc)
  }
  let select = entry.values
  let pre_select = null
  //let select = null
  //console.log("select_aspect_loc", aspect_loc)
  const final_loc = ld.last(aspect_loc)

  let skip_collect = false
  let skip_entry_collect = false

  let entry_uuid = undefined
  let as_edit = false

  for (let loc of aspect_loc) {
    if (DEBUG_SIMPLE) {
      console.log("loc", loc)
    }
    if (select) {
      pre_select = select
    }
    try {
      //console.log("->", select, loc, "sc", skip_collect, "sec", skip_entry_collect)
      const A_TYPE = loc[0]
      const A_VALUE = loc[1]
      // ** CLOSE COLLECTORS

      if (skip_collect) {
        if (A_TYPE === COLLECT_CLOSE) {
          //console.log(COLLECT_CLOSE)
          skip_collect = false
        }
      } else if (skip_entry_collect) {
        if (A_TYPE === ENTRY_COLLECT_CLOSE) {
          //console.log(ENTRY_COLLECT_CLOSE)
          skip_entry_collect = false
        }
        // **
      } else if (A_TYPE === META) {
        if (as_edit) {
          select = entries_mod.edit[A_VALUE]
        } else {
          select = entries_mod.entries.get(entry_uuid)[A_VALUE]
        }
      } else if (A_TYPE === ASPECT) {
        select = select[A_VALUE]
      } else if (A_TYPE === COMPONENT) {
        select = select.value[A_VALUE]
      } else if (A_TYPE === INDEX) {
        // console.log(INDEX, select, loc)
        if (A_VALUE >= select.value.length) {
          console.log("lib.entry.value: index out of bounds", A_VALUE, "length:", select.value.length)
          return pack_value(null)
        }
        select = select.value[A_VALUE]
      } else if (loc[0] === COLLECT) {
        let collect_over_list = select.value
        if (DEBUG_SIMPLE) {
          console.log(COLLECT, " over list", collect_over_list)
        }
        // might be a list of basic types or a list of composite, check aspect_loc
        let reduced_loc = ld.takeWhile(ld.takeRightWhile(aspect_loc, al => {
            return al !== loc
          }
        ), al => {
          return al[0] !== COLLECT_CLOSE
        })
        if (DEBUG_SIMPLE) {
          console.log(COLLECT, "reduced_loc", reduced_loc)
        }
        if (reduced_loc.length === 0) {
          // TODO simple type, done? TEST
          return collect_over_list
        } else if (reduced_loc.length === 1) {
          let collected = ld.map(collect_over_list, comp => {
            return comp.value[reduced_loc[0][1]]
          })
          collected = ld.filter(collected, v => (!!v))
          //console.log(COLLECT, "collected", collected)
          select = {value: collected, list: true}
          //console.log("collected", select)
          skip_collect = true
        } else {
          console.log("non-tested collect, larger aspect_loc")
        }
      } else if (A_TYPE === ENTRY_COLLECT || A_TYPE === ENTRY_COLLECT_LINK) {
        /*
          [ ENTRY_COLLECT
          > ENTRY_COLLECT_LINK
         */
        //console.log(ENTRY_COLLECT, "!", select, aspect_loc)
        select = select[A_VALUE]
        let reduced_loc = ld.takeRightWhile(aspect_loc, al => {
          return al !== loc
        })
        reduced_loc = ld.takeWhile(reduced_loc, al => {
          return al[0] !== ENTRY_COLLECT_CLOSE
        })
        // console.log(ENTRY_COLLECT, "reduced_loc", reduced_loc)
        let collected = []
        // this turns list of entry-selects into entrylists, which are list of uuids.
        // todo lists of entry-selects can have unregular values, they should not be allowed or filtered out here
        const unpacked = recursive_unpack(select.value)
        console.log(unpacked === recursive_unpack2(select.value))

        unpacked.forEach(e_uuid => {
          // todo isnt this just the complete ... call
          let entry_loc = ld.concat([[ENTRY, e_uuid]], reduced_loc)
          let val = select_aspect_loc(entries_mod, entry_loc)
          //console.log(ENTRY_COLLECT, "e-val", val)
          // todo, check if required, maybe concat manages it
          if (val[LIST]) {
            if (A_TYPE === ENTRY_COLLECT_LINK) {
              // console.log(val)
              val.value = ld.map(val.value, v => {
                return {value: e_uuid, text: v.value}
              })
              // TODO: NOT TESTed
              val.value = ld.filter(val.value, v => v.value !== null)
              //console.log("<", val)
              collected = ld.concat(collected, val.value)
            } else {
              //console.log("adding val", val)
              const new_values = ld.map(val.value, v => {
                return v.value
              })
              collected = ld.concat(collected, new_values)
              //console.log("collected", collected)
            }
          } else {
            if (A_TYPE === ENTRY_COLLECT_LINK) {
              if (val.value) {
                // todo, shouldnt have a text?
                collected = ld.concat(collected, {value: e_uuid, text: val.value})
              }
            } else {
              collected = ld.concat(collected, val)
            }
          }
        })
        // console.log("collected", collected)
        skip_entry_collect = true
        select = pack_value(collected)
      } else {
        console.log("ERROR store.entries.  select ", select, "location", loc)
      }
    } catch (e) {
      console.log("entry.select_aspect_loc failed for select:", select, "with location:", loc, "aspect_loc", aspect_loc, "options", pre_select)
      if (process.env.NODE_ENV !== "production" && DEV_TRIGGER_EXCEPTION)
        throw "entry.select_aspect_loc failed for select:" + select + "with location:" + loc + "aspect_loc" + aspect_loc
      else
        return pack_value(null)
    }
    if (DEBUG_SIMPLE) {
      console.log("select", select)
    }
    if (!select) {
      console.log("SELECT failed for", "select:", select, loc, "options", pre_select, "aspect_loc", aspect_loc,)
      return undefined
    }
  }
  // console.log("returning", select)
  return select
}

export function get_entry_titleAspect(template) {
  if (template.rules.hasOwnProperty(TITLE_ASPECT)) {
    return template.rules.titleAspect
  } else {
    if (template.aspects[0].type === STR) {
      return "# " + template.aspects[0].name
    } else {
      //console.log("WARNING: no proper titleAspect for the type", entry_type.title)
      return null
    }
  }
}


export function default_values(template) {
  let values = {}
  let aspects = template.aspects
  for (let aspect_i in aspects) {
    let aspect = aspects[aspect_i]
    //console.log("lib/entry: default value of aspect", aspect)
    values[aspect.name] = aspect_default_value(aspect)
  }
  return values
}

export function current_user_is_owner(store, entry) {
  return ld.find(entry.actors.owners, (o) => o.registered_name === store.getters.user.registered_name)
}

export function has_parent(entry) {
  return ld.get(entry, "refs.parent", null) !== null
}

export function has_pages(template) {
  return template.rules.hasOwnProperty("pages")
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
      loc = cut_from(loc, 1)
    } else if (pre_set === "$uuid") {
      select = ld.get(entries_mod, "entries")
      if (select)
        select = select.get(parts[1]).values
      loc = cut_from(loc, 2)
    }
  }
  if (!select)
    return null
  const result = recursive_select(select, loc)
  // console.log("ress", result)
  return result
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
  const groups =  tags.reduce((groups, tag_val) => {
    if (!groups.hasOwnProperty(tag_val.name)) {
      groups[tag_val.name] = new Set()
    }
    groups[tag_val.name].add(tag_val.value)
    return groups
  }, {})

  return ld.mapValues(groups, tags => Array.from(tags))
}
