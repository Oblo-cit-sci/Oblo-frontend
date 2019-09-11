import {ASPECT, DRAFT, EDIT, ENTRY, INDEX, PRIVATE_LOCAL, STR, TITLE_ASPECT, VIEW} from "./consts"

import Basic from "../components/aspectInput/Basic"
import TextShort from "../components/aspectInput/TextShort"
import TextLong from "../components/aspectInput/TextLong"
import NumberAspect from "../components/aspectInput/NumberAspect"
import DateAspect from "../components/aspectInput/DateAspect"
import Location from "../components/aspectInput/Location"


import List from "../components/aspectInput/List"
import ListOf from "../components/aspectInput/ListOf"

import CompositeAspect from "../components/aspectInput/CompositeAspect"
import OptionsAspect from "../components/aspectInput/OptionsAspect";

import Select from "../components/aspectInput/Select"
import TreeSelect from "../components/aspectInput/TreeSelect"
import MultiSelect from "../components/aspectInput/MultiSelectAspect";
import UrlView from "../components/aspectInput/composite_views/UrlView";
import {user_ref} from "./client";
import {delim2str} from "./aspect";
import {ENTRIES_CREATE, ENTRIES_SAVE_ENTRY, ENTRIES_SET_REF_PARENT, UPDATE_DRAFT_NUMBER} from "./store_consts";

const ld = require("lodash")
const uuidv4 = require('uuid/v4')

export function MAspectComponent(aspect, mode = EDIT, extra = {}) {
  switch (aspect.type) {
    case "str":
      let max = aspect.attr.max || 8000 // or make this explicit in python
      if (max <= 100) {
        return TextShort
      } else {
        return TextLong
      }
    case "int":
    case "float":
      return NumberAspect
    // case "@user":
    //   return SelectUser
    case "date":
      return DateAspect
    case "gps":
      return Location
    case "list":
      return List
    case "entrylist":
      return ListOf
    case "composite":
      if (mode === VIEW && aspect.view_type)
        return composite_views(aspect.view_type)
      else
        return CompositeAspect
    case "options":
      return OptionsAspect
    case Select:
      return Select
    case "multiselect":
      return MultiSelect
    case "tree":
      return TreeSelect
    default:
      console.log("No Aspect component for", aspect.name, aspect.type, aspect.type === "options")
      return Basic
  }
}


function composite_views(name) {
  if (name === "url") {
    return UrlView;
  } else
    return CompositeAspect;
}


export function aspect_raw_default_value(aspect) {
  //console.log("aspect_raw_default_value", aspect.name, aspect)
  try {
    if (aspect.type.startsWith("!")) {
      return aspect.default
    }
    switch (aspect.type) {
      case "str":
        return ""
      case "int":
        // todo could also check attr.min
        return null
      case "float":
        return null
      case "@user":
        return null
      case "date":
        return new Date()
      case "gps":
        return null
      case "list":
        return []
      case "entrylist":
        return []
      case "tree":
        return null
      case "composite":
        let res = {}
        aspect.components.forEach(c => {
          res[c.name] = {value: aspect_raw_default_value(c)} //aspect_wrapped_default_value(c, {name: c.name})
        })
        return res
      //return ld.map(aspect.components, (c) => [c.name, aspect_wrapped_default_value(c, {name: c.name})]))
      case "options":
        return null
      case "select":
        return null
      case "multiselect":
        return null
      default:
        console.log("Warning trying to ge default value of aspect of unknown type", aspect)
        return null
    }
  } catch (e) {
    console.log("cannot get default value of aspect", aspect.name, aspect)
    return null
  }
}

export function aspect_wrapped_default_value(aspect, merge = {}) {
  return Object.assign({value: aspect_raw_default_value(aspect)}, merge)
}

export function create_and_store(type_slug, store, ref = null) {
  let entry_type = store.getters.entry_type(type_slug)
  console.log(type_slug, entry_type)
  let aspects = entry_type.content.aspects

  for (let aspect_i in aspects) {
    let aspect = aspects[aspect_i]
    // todo this happens already in MAspectComponent
    aspect.attr = aspect.attr || {}
    if ((aspect.attr.view || "inline") === "page") {
      //aspect.attr.draft_id = this.draft_id
      aspect.attr.aspect_index = aspect_i
    }
  }

  let entry = create_entry(store, type_slug)
  //console.log("lib/entry create_and_store", entry)
  store.commit(ENTRIES_CREATE, entry)
  if (ref) {
    store.commit(ENTRIES_SET_REF_PARENT, {uuid: entry.uuid, ref: ref})
  }
  return entry
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

export function aspect_default_value(store, aspect) {
  try {
    //console.log("aspect_default_value", aspect)
    if (aspect.attr.value) {
      return {value: aspect.attr.value}
    } else {
      return aspect_wrapped_default_value(aspect)
    }
  } catch (e) {
    console.log("ERROR. entry.default_values fails on aspect", aspect.name, " attr missing. not so bad tho. gonna set it anyway")
    return aspect_wrapped_default_value(aspect)
  }
}

/**
 * check if a string looks like its an aspect ref
 * TODO NOT NEEDED ATM
 */
export function is_aspect_ref_string(value) {
  let ref_character = Object.keys(delim2str).find(c => value.charAt(0) === c)
  return ref_character !== undefined;
}

export function default_values(store, entry_type) {
  let values = {}
  let aspects = entry_type.content.aspects
  for (let aspect_i in aspects) {
    let aspect = aspects[aspect_i]
    //console.log("lib/entry: default value of aspect", aspect)
    values[aspect.name] = aspect_default_value(store, aspect)
  }
  // console.log("D vals", values)
  return values
}

export function autosave(store, entry) {
  save_entry(store, entry, false)
}

export function save_entry(store, entry, increase_version = true) {
  if (increase_version) {
    entry.version = entry.version + 1
  }
  store.commit(ENTRIES_SAVE_ENTRY, entry)
}


export function current_user_is_owner(store, entry) {
  return ld.find(entry.actors.owners, (o) => o.registered_name === store.state.user.user_data.registered_name)
}

export async function fetch_entry(store, axios, uuid) {
  let {data} = await axios.get("/entry/" + uuid);
  //console.log("fetched", data.result)
  store.commit(ENTRIES_SAVE_ENTRY, data.result)
  return data.result
}

export function find_aspect_with_name(arr, name) {
  return ld.find(arr, (a) => a.name === name)
}

export function findex_aspect_index_with_name(arr, name) {
  return ld.findIndex(arr, a => a.name === name)
}

// TODO depracated, but replace is usefull?
export function aspect_loc_str(aspect_loc) {
  // getting either "a" or "i", first letter
  // of all aspect_loc first index values and the 2nd value as string
  return ld.map(aspect_loc, al => al[0][0] + "-" + al[1]).join("_").replace(/[^_a-zA-Z0-9-]/g, "_")
}

export function has_parent(entry) {
  return entry.refs.parent
}

export function has_pages(entry_type) {
  return entry_type.content.meta.hasOwnProperty("pages")
}
