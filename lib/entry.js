import {
  ASPECT,
  COLLECT,
  COLLECT_CLOSE,
  COMPONENT,
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
import {aspect_default_value, aspect_loc_str2arr, pack_value} from "./aspect";

import {recursive_unpack} from "./util";
import {user_ref} from "./actors";
import {CREATOR} from "~/lib/actors";

const pkg = require('../package')

// todo should come from nuxt.config.js : config.aspect_select_debug
const DEBUG = false
const DEBUG_SIMPLE = true

const DEV_TRIGGER_EXCEPTION = false

const ld = require("lodash")
const uuidv4 = require('uuid/v4')

// todo, there are a few depending functions that I dont test atm (entrylist-aspect, child-create in preview
// several references, in e-listAspect,  e-preview (but not used atm)
export function create_entry(store, template_slug, init = {}) {
  // todo different owner in case of visitor
  // console.log("entry of template_slug", type_slug)
  const template = store.getters["templates/entry_type"](template_slug)
  // console.log("type of template_slug",template)

  const user_data = store.getters.user
  const title = init.title || template.title

  // console.log("ET",  store.getters["user/settings_value"]("default_license"))
  const entry = {
    //template: init.entry_type, // maybe out later...
    template: {
      uuid: template.uuid,
      slug: template_slug
    },
    template_version: template.version,
    values: init.values || default_values(tdefault_licenseemplate),
    type: REGULAR,
    license:
      template.rules.license ? template.rules.license :
        (template.rules.privacy === PRIVATE_LOCAL ? "None" : store.getters["user/settings_value"]("default_license")),
    privacy: template.rules.privacy ? template.rules.privacy : store.getters["user/settings_value"]("default_privacy"),
    title: title,
    entry_refs: {}, // ne
    tags: {},
    status: DRAFT, // todo should go to local
    uuid: uuidv4(),
    version: 0,
    local: { // local stuff that wont go to the server
      dirty: false,
    },
    location: init.location || null,
    actors: [{
      role: CREATOR,
      actor: user_ref(user_data)
    }
    ],
    app_version: pkg.version,
    domain: template.domain,
    creation_ts: new Date(),
    attached_files: []
  }
  if (template.rules.titleAspect) {
    // is this the best way to check something and have a default of
    // set title aspect.default true
    if (template.rules.hasOwnProperty("setTitleAspect")) {
      if (template.rules.setTitleAspect) {
        set_titleAspect(store, entry)
      }
    } else {
      set_titleAspect(store, entry)
    }
  }
  return entry
}


// todo this can make use one of the more generic setter methods
export function set_titleAspect(store, entry) {
  const template = store.getters["templates/entry_type"](entry.template.slug)
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

  // console.log("-->", aspect_loc, aspect_loc[0][0], aspect_loc[1][0], aspect_loc[1][0] === "NEW_LOC_FORMAT")
  if (ld.get(aspect_loc,"0.0")=== "NEW_LOC_FORMAT") {
    // console.log(aspect_loc, aspect_loc.slice(1))
    return temp_direct_select(entries_mod, aspect_loc[0][1])
  }
  if (ld.get(aspect_loc,"1.0") === "NEW_LOC_FORMAT") {
    // console.log(aspect_loc, aspect_loc.slice(1), aspect_loc.slice(2))
    return temp_direct_select(entries_mod, aspect_loc[1][1])
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
          //console.log(entry.title, entry, entry.template.slug)
          while (entry.type_slug !== A_VALUE) {
            // check here if parent doesnt exists
            entry = entries_mod.entries.get(entry.entry_refs.parent.uuid)
            // console.log("checking type", entry.title, entry.template.slug, A_VALUE, "?")
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

export function full_title(store, entry) {
  return "FULL TITLE REPLACE!" // store.getters["templates/type_name"](entry.template.slug) + (entry.title ? ": " + entry.title : "")
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
  const parts = loc.split(".")
  const pre_setter = ["$edit", "$uuid"]
  let select = null
  if (pre_setter.includes(parts[0])) {
    const pre_set = parts[0]
    if (pre_set === "$edit") {
      select = ld.get(entries_mod, "edit.values")
      loc = cut_from(loc,1)
    } else if (pre_set === "$uuid") {
      select = ld.get(entries_mod,"entries")
      if (select)
        select = select.get(parts[1]).values
      loc = cut_from(loc,2)
    }
  }
  if(!select)
    return null
  const result = recursive_select(select, loc)
  // console.log("ress", result)
  return result
}
