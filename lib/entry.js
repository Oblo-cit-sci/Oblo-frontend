import {
  ASPECT, COLLECT, COLLECT_CLOSE,
  COMPONENT,
  DRAFT, EDIT,
  ENTRY,
  ENTRY_COLLECT, ENTRY_COLLECT_CLOSE, ENTRY_COLLECT_LINK,
  ENTRY_INDEX, ENTRY_LINK_FOLLOW,
  INDEX, LIST,
  PARENT,
  PRIVATE_LOCAL,
  STR,
  TITLE_ASPECT
} from "./consts"
import {user_ref} from "./client";
import {ENTRIES_CREATE, ENTRIES_SAVE_ENTRY, UPDATE_DRAFT_NUMBER} from "./store_consts";
import {aspect_default_value, pack_value} from "./aspect";

import app from "../.nuxt/App.js"

const pkg = require('../package')

// todo should come from nuxt.config.js : config.aspect_select_debug
const DEBUG = false

const ld = require("lodash")
const uuidv4 = require('uuid/v4')


export function create_entry(store, type_slug, init = {}, parent = null) {
  // todo different owner in case of visitor
  const entry_type = store.getters.entry_type(type_slug)
  const draft_no = get_update_draft_no(store, type_slug)
  const user_data = store.state.user.user_data

  const entry = {
    //entry_type: init.entry_type, // maybe out later...
    type_slug: type_slug,
    draft_no: draft_no,
    aspects_values: init.aspects_values || default_values(entry_type),
    license:
      entry_type.content.meta.license ? entry_type.content.meta.license :
        (entry_type.content.meta.privacy === PRIVATE_LOCAL ? "None" : user_data.defaultLicense),
    privacy: entry_type.content.meta.privacy ? entry_type.content.meta.privacy : user_data.defaultPrivacy,
    title: entry_type.title + " " + draft_no,
    //ref: null,// todo rename to parent
    refs: {
      parent: parent,
      children: {}
    }, // ne
    status: DRAFT, // should go to local
    uuid: uuidv4(),
    version: 0,
    local: { // local stuff that wont go to the server
      dirty: false,
      prev: null,
      //downloaded
      //draft_no
    },
    actors: {
      creator: user_ref(user_data),
      owners: [user_ref(user_data)]
    },
    parent_type_version: entry_type.version,
    software_version: pkg.version,
    downloads: false, // should go to local
    creation_datetime: new Date()
  }
  store.commit(ENTRIES_CREATE, entry);
  return entry
}


export function select_aspect_loc(entries_mod, aspect_loc, skip_final = false) {
  if(DEBUG) {
    console.log("select_aspect_loc", aspect_loc)
  }
  let pre_select = null
  let select = null
  //console.log("select_aspect_loc", aspect_loc)
  const final_loc = ld.last(aspect_loc)

  let skip_collect = false
  let skip_entry_collect = false
  for (let loc of aspect_loc) {
    if(DEBUG) {
      console.log("loc", loc)
    }
    if (select) {
      pre_select = select
    }
    try {
      //console.log("->", select, loc, "sc", skip_collect, "sec", skip_entry_collect)
      const A_TYPE = loc[0]
      const A_VALUE = loc[1]
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
      } else if (A_TYPE === EDIT) {
        // console.log(EDIT, entries_mod)
        select = entries_mod.edit.aspects_values
      } else if (A_TYPE === ENTRY) {
        select = entries_mod.entries.get(A_VALUE).aspects_values
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
            entry = entries_mod.entries.get(entry.refs.parent.uuid)
          }
        } else { // A_VALUE is not a number.
          //console.log("access parent by slug",A_VALUE)
          //console.log(entry.title, entry, entry.type_slug)
          while (entry.type_slug !== A_VALUE) {
            // check here if parent doesnt exists
            entry = entries_mod.entries.get(entry.refs.parent.uuid)
            // console.log("checking type", entry.title, entry.type_slug, A_VALUE, "?")
          }
        }
        select = entry.aspects_values
      } else if (A_TYPE === ASPECT) {
        select = select[A_VALUE]
      } else if (A_TYPE === COMPONENT) {
        select = select.value[A_VALUE]
      } else if (A_TYPE === INDEX) {
        // console.log(INDEX, select, loc)
        if (A_VALUE >= select.value.length) {
          console.log("lib.entry.value: index out of bounds")
          return pack_value(null)
        }
        select = select.value[A_VALUE]
      } else if (A_TYPE === ENTRY_INDEX) {
        select = entries_mod.entries.get(select.value[A_VALUE])
        if (!select) {
          console.log("lib.entry.value: entry-index out of bounds")
          return pack_value(null)
        } else {
          select = select.aspects_values
        }
      } else if (loc[0] === COLLECT) {
        let collect_over_list = select.value
        if(DEBUG) {
          console.log(COLLECT," over list", collect_over_list)
        }
        // might be a list of basic types or a list of composite, check aspect_loc
        let reduced_loc = ld.takeWhile(ld.takeRightWhile(aspect_loc, al => {
            return al !== loc
          }
        ), al => {
          return al[0] !== COLLECT_CLOSE
        })
        if(DEBUG) {
          console.log(COLLECT, "reduced_loc", reduced_loc)
        }
        if (reduced_loc.length === 0) {
          // TODO simple type, done? TEST
          return collect_over_list
        } else if (reduced_loc.length === 1) {
          let collected = ld.map(collect_over_list, comp => {
            return comp.value[reduced_loc[0][1]]
          })
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
        select.value.forEach(e_uuid => {
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
              //console.log("<", val)
              collected = ld.concat(collected, val.value)
              //console.log("col E ", collected)
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
              //console.log("<", e_uuid, val)
              // todo, shouldnt have a text?
              collected = ld.concat(collected, {value: e_uuid, text: val.value})
            } else {
              collected = ld.concat(collected, val)
            }
          }
        })
        // console.log("collected", collected)
        skip_entry_collect = true
        select = pack_value(collected)
      } else if (A_TYPE === ENTRY_LINK_FOLLOW) {
        if(!select || !select.value) {
          return pack_value(null)
        } else {
          select = entries_mod.entries.get(select.value).aspects_values
        }
      } else {
        console.log("ERROR store.entries.  select ", select, "location", loc)
      }
    } catch (e) {
      console.log("entry.select_aspect_loc failed for select:", select, "with location:", loc, "aspect_loc", aspect_loc)
      if (process.env.NODE_ENV !== "production")
        throw "entry.select_aspect_loc failed for select:" + select + "with location:" + loc + "aspect_loc" + aspect_loc
      else
        return pack_value(null)
    }
    if(DEBUG) {
      console.log("select", select)
    }
    if (!select) {
      console.log("SELECT failed for", aspect_loc, "pre", pre_select)
      return null
    }
  }
  // console.log("returning", select)
  return select
}

export function get_entry_titleAspect(entry_type) {
  if (entry_type.content.meta.hasOwnProperty(TITLE_ASPECT)) {
    return entry_type.content.meta.titleAspect
  } else {
    if (entry_type.content.aspects[0].type === STR) {
      return "# " + entry_type.content.aspects[0].name
    } else {
      console.log("WARNING: no proper titleAspect for the type", entry_type.title)
      return ""
    }
  }
}


function get_update_draft_no(store, entry_type) {
  const draft_no = store.getters.draft_no(entry_type)
  store.commit(UPDATE_DRAFT_NUMBER, entry_type)
  return draft_no
}


export function default_values(entry_type) {
  let values = {}
  let aspects = entry_type.content.aspects
  for (let aspect_i in aspects) {
    let aspect = aspects[aspect_i]
    //console.log("lib/entry: default value of aspect", aspect)
    values[aspect.name] = aspect_default_value(aspect)
  }
  return values
}

/*
export function autosave(store, entry) {
  save_entry(store, entry, false)
}

export function save_entry(store, entry, increase_version = true) {
  if (increase_version) {
    entry.version = entry.version + 1
  }
  store.commit(ENTRIES_SAVE_ENTRY, entry)
}
*/

export function current_user_is_owner(store, entry) {
  return ld.find(entry.actors.owners, (o) => o.registered_name === store.state.user.user_data.registered_name)
}

export async function fetch_entry(store, axios, uuid) {
  let {data} = await axios.get("/entry/" + uuid);
  //console.log("fetched", data.result)
  store.commit(ENTRIES_SAVE_ENTRY, data.result)
  return data.result
}


export function has_parent(entry) {
  return entry.refs.parent
}

export function has_pages(entry_type) {
  return entry_type.content.meta.hasOwnProperty("pages")
}

