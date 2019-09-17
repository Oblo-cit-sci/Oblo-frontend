import {ASPECT, COMPONENT, DRAFT, ENTRY, ENTRY_INDEX, INDEX, PARENT, PRIVATE_LOCAL, STR, TITLE_ASPECT} from "./consts"
import {user_ref} from "./client";
import {ENTRIES_CREATE, ENTRIES_SAVE_ENTRY, UPDATE_DRAFT_NUMBER} from "./store_consts";
import {aspect_default_value} from "./aspect";

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

  const final_loc = ld.last(aspect_loc)

  for (let loc of aspect_loc) {
    try {
      if (skip_final && loc === final_loc) {
        break
      } else if (loc[0] === ENTRY) {
        select = entries.get(loc[1]).aspects_values
      } else if (loc[0] === PARENT) {
        const number_of_levels = parseInt(loc[1])
        // start from the 1.
        let entry = entries.get(aspect_loc[0][1])
        for (let i = 0; i < number_of_levels; i++) {
          entry = entries.get(entry.refs.parent.uuid)
        }
        select = entry.aspects_values
      } else if (loc[0] === ASPECT) {
        select = select[loc[1]]
      } else if (loc[0] === COMPONENT) {
        select = select.value[loc[1]]
      } else if (loc[0] === INDEX) {
        select = select.value[loc[1]]
      } else if (loc[0] === ENTRY_INDEX) {
        select =  entries.get(select.value[loc[1]]).aspects_values
      } else {
        console.log("ERROR store.entries. location", loc)
      }
    } catch (e) {
      console.log("entry.select_aspect_loc failed for select:", select, "with location:", loc, "aspect_loc", aspect_loc)
      return null
    }
  }

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
