import {
  ASPECT, COLLECT, COLLECT_CLOSE,
  COMPONENT,
  DRAFT,
  ENTRY,
  ENTRY_COLLECT, ENTRY_COLLECT_CLOSE,
  ENTRY_INDEX,
  INDEX, LIST,
  PARENT,
  PRIVATE_LOCAL,
  STR,
  TITLE_ASPECT
} from "./consts"
import {user_ref} from "./client";
import {ENTRIES_CREATE, ENTRIES_SAVE_ENTRY, UPDATE_DRAFT_NUMBER} from "./store_consts";
import {aspect_default_value, pack_value} from "./aspect";

const ld = require("lodash")
const uuidv4 = require('uuid/v4')


// otherwise client fucks up Site creation.... TODO!
export function trash() {
}


export function create_entry(store, type_slug, init = {}, parent = null) {
  // todo different owner in case of visitor
  const entry_type = store.getters.entry_type(type_slug)
  const draft_no = get_update_draft_no(store, type_slug)
  const user_data = store.state.user.user_data

  const entry = {
    //entry_type: init.entry_type, // maybe out later...
    type_slug: type_slug,
    draft_no: draft_no,
    aspects_values: init.aspects_values || default_values(store, entry_type),
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
    downloads: false, // should go to local
    creation_datetime: new Date()
  }

  store.commit(ENTRIES_CREATE, entry);
  return entry
}


export function select_aspect_loc(entries, aspect_loc, skip_final = false) {
  let select = null
  // console.log("select_aspect_loc", aspect_loc)
  const final_loc = ld.last(aspect_loc)

  let skip_collect = false
  let skip_entry_collect = false
  for (let loc of aspect_loc) {
    try {
      //console.log("->", select, loc, "sc", skip_collect, "sec", skip_entry_collect)
      const A_TYPE = loc[0]
      const A_VALUE = loc[1]
      if (skip_final && loc === final_loc) {
        break
      } if(skip_collect) {
        if(loc[0] === COLLECT_CLOSE) {
          skip_collect = false
        }
      } else if(skip_entry_collect) {
        if(loc[0] === ENTRY_COLLECT_CLOSE) {
          skip_entry_collect = false
        }
      } else if (loc[0] === ENTRY) {
        select = entries.get(loc[1]).aspects_values
      } else if (loc[0] === PARENT) {
        const number_of_levels = parseInt(loc[1])
        // start from the 1.
        let entry = entries.get(aspect_loc[0][1]) // this entry
        if(number_of_levels) {
          for (let i = 0; i < number_of_levels; i++) {
            entry = entries.get(entry.refs.parent.uuid)
          }
        } else { // loc[1] is not a number.
          //console.log("access parent by slug",loc[1])
          //console.log(entry.title, entry, entry.type_slug)
          while(entry.type_slug !== loc[1]) {
            // check here if parent doesnt exists
            entry = entries.get(entry.refs.parent.uuid)
            //console.log(entry.title, entry.type_slug)
          }
        }
        select = entry.aspects_values
      } else if (loc[0] === ASPECT) {
        select = select[loc[1]]
      } else if (loc[0] === COMPONENT) {
        select = select.value[loc[1]]
      } else if (loc[0] === INDEX) {
        console.log(INDEX, select, loc)
        if(loc[1] >= select.value.length) {
          console.log("lib.entry.value: index out of bounds")
          return pack_value(null)
        }
        select = select.value[loc[1]]
      } else if (loc[0] === ENTRY_INDEX) {
        select = entries.get(select.value[loc[1]]).aspects_values
      } else if(loc[0] === COLLECT) {
        // console.log(COLLECT, "!", select)
        let collect_over_list = select.value
        // might be a list of basic types or a list of composite, check aspect_loc
        let reduced_loc = ld.takeWhile(ld.takeRightWhile(aspect_loc, al => {
            return al !== loc
          }
        ), al => { return al[0] !== COLLECT_CLOSE })
        // console.log(COLLECT, "reduced_loc", reduced_loc)
        // console.log(COLLECT, select, loc, "list", collect_over_list)
        if(reduced_loc.length === 0) {
          // TODO simple type, done? TEST
          // console.log(COLLECT, "TODO test!")
          return collect_over_list
        } else if(reduced_loc.length === 1) {
          let collected = ld.map(collect_over_list, (comp) => {
            return comp.value[reduced_loc[0][1]]
          })
          // console.log(COLLECT, "collected", collected)
          select = {value: collected, list: true}
          skip_collect = true
        }
      } else if (loc[0] === ENTRY_COLLECT) {
        // console.log(ENTRY_COLLECT, "!", select, aspect_loc)
        select = select[loc[1]]
        let reduced_loc =ld.takeRightWhile(aspect_loc, al => {
          return al !== loc
        })
        reduced_loc =ld.takeWhile(reduced_loc, al => {
          return al[0] !== ENTRY_COLLECT_CLOSE
        })
        // console.log(ENTRY_COLLECT, "reduced_loc", reduced_loc)
        let collected = []
        select.value.forEach(e => {
          // todo isnt this just the complete ... call
          let entry_loc = ld.concat([[ENTRY, e]] , reduced_loc)
          let val = select_aspect_loc(entries, entry_loc)
          // todo, check if required, maybe concat manages it
          if(val[LIST]) {
            collected = ld.concat(collected, val.value)
          } else {
            console.log("TODO collect basic types")
          }
        })
        // console.log(ENTRY_COLLECT, "collected", collected)
        skip_entry_collect = true
        select =  pack_value(collected)
      } else {
        console.log("ERROR store.entries. ", select, "location", loc)
      }
    } catch (e) {
      console.log("entry.select_aspect_loc failed for select:", select, "with location:", loc, "aspect_loc", aspect_loc)
      return pack_value(null)
    }
  }
  // console.log("returning", select)
  return select
}

export function get_TitleAspect(entry_type) {
  if (entry_type.content.meta.hasOwnProperty(TITLE_ASPECT)) {
    return entry_type.content.meta.titleAspect
  } else {
    if (entry_type.content.aspects[0].type === STR) {
      return entry_type.content.aspects[0].name
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


export function default_values(store, entry_type) {
  let values = {}
  let aspects = entry_type.content.aspects
  for (let aspect_i in aspects) {
    let aspect = aspects[aspect_i]
    //console.log("lib/entry: default value of aspect", aspect)
    values[aspect.name] = aspect_default_value(store, aspect)
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

export function get_uuid(aspect_loc) {
  return aspect_loc[0][1]
}
