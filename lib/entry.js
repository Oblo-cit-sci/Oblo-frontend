import {ASPECT, DRAFT, EDIT, ENTRY, INDEX, PRIVATE_LOCAL, STR, TITLE_ASPECT, VIEW} from "./consts"

import Basic from "../components/aspectInput/Basic"
import TextShort from "../components/aspectInput/TextShort"
import TextLong from "../components/aspectInput/TextLong"
import NumberAspect from "../components/aspectInput/NumberAspect"
import DateAspect from "../components/aspectInput/DateAspect"
import Location from "../components/aspectInput/Location"


import List from "../components/aspectInput/List"
import ListOf from "../components/aspectInput/ListOf"
import AspectPageButton from "../components/aspectInput/AspectPageButton"

import CompositeAspect from "../components/aspectInput/CompositeAspect"
import OptionsAspect from "../components/aspectInput/OptionsAspect";

import Select from "../components/aspectInput/Select"
import TreeSelect from "../components/aspectInput/TreeSelect"
import MultiSelect from "../components/aspectInput/MultiSelectAspect";
import UrlView from "../components/aspectInput/composite_views/UrlView";
import {user_ref} from "./client";
import {aspect_loc_str2arr, delim2str} from "./aspect";

const ld = require("lodash")
const uuidv4 = require('uuid/v4')


export function MAspectComponent(aspect, mode = EDIT, extra = {}) {
  //console.log(aspect, ignore_page, mode)
  //console.log("select Aspect component for ", aspect)
  let attr = aspect.attr || {}
  let pageAspect = attr.pageAspect || false

  if (pageAspect && !extra.hasOwnProperty("ignore_pageAspect")) {
    return AspectPageButton
  } else if (!pageAspect || extra.ignore_pageAspect) {
    if (aspect.type === "str") {
      let max = aspect.attr.max || 8000 // or make this explicit in python
      if (max <= 100) {
        return TextShort
      } else {
        return TextLong
      }
    } else if (aspect.type === "int") {
      return NumberAspect
    } else if (aspect.type === "float") {
      return NumberAspect
    } else if (aspect.type === "@user") {
      return SelectUser
    } else if (aspect.type === "date") {
      return DateAspect
    } else if (aspect.type === "gps") {
      return Location
    } else if (aspect.type === "list") {
      return MListAspectComponent(aspect)
    } else if (aspect.type === "composite") {
      if (mode === VIEW && aspect.view_type)
        return composite_views(aspect.view_type)
      else
        return CompositeAspect
    } else if (aspect.type === "options") {
      /*if(mode === VIEW && aspect.view_type)
        return options_views(aspect.view_type)
      else*/
      return OptionsAspect
    } else if (aspect.type === "select") {
      return Select
    } else if (aspect.type === "multiselect") {
      return MultiSelect
    } else if (aspect.type === "tree") {
      return TreeSelect
    } else if (aspect.type.startsWith("!")) {
      return aspect.type.substring(1)
    }
  }
  console.log("No Aspect component for", aspect.name, aspect.type, aspect.type === "options")
  return Basic
}

function composite_views(name) {
  if (name === "url") {
    return UrlView;
  } else
    return CompositeAspect;
}

function options_views(view_type) {
  // complete aspect defintion
  if (view_type.hasOwnProperty("type")) {
    return options_views(view_type, false, false, "view")
  }
}

function MListAspectComponent(aspect) {
  let item_type = aspect.items

  //console.log("list with", typeof (item_type))
  if (typeof (item_type) === "string") {
    let passed_options = aspect.items
    // a "*" means, lookup code and set the values as options
    // todo does not have to be a string only, can also be a composite, which is marked as page-aspect
    // or maybe no, and the smartness is in attr e.g. "attr.view = page"

    if (typeof (passed_options) === "string") {
      let type_char = passed_options.charAt(0)
      // Select from code
      if (type_char === "*") {
        //passed_options = this.$store.state.codes[passed_options.substring(1)]
        // console.log("taking code for list", given_options.substring(1))
        console.log("TODO!!! code options", passed_options)
        return List
      }
      if (type_char === "$") {
        return ListOf
      }
      if (passed_options === "composite") {
        return ListOf
      }
    }
    return List
  }
  return List
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
  store.commit("entries/create", entry)
  if (ref) {
    store.commit("entries/set_ref_parent", {uuid: entry.uuid, ref: ref})
  }
  return entry
}


export function create_entry(store, type_slug, init = {}, parent_uuid = null) {
  // todo different owner in case of visitor

  const entry_type = store.getters.entry_type(type_slug)
  const draft_no = get_update_draft_no(store, type_slug)
  const user_data = store.state.user.user_data
  //let aspects = entry_type.content.aspects;

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
      parent: parent_uuid,
      children: {}
    }, // ne
    status: DRAFT,
    uuid: uuidv4(),
    version: 0,
    actors: {
      creator: user_ref(user_data),
      owners: [user_ref(user_data)]
    },
    parent_type_version: entry_type.version,
    downloads: false,
    creation_datetime: new Date()
  }

  store.commit("entries/create", entry);
  //store.dispatch("test/create", entry)

  //console.log(entry)
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
  store.commit("update_draft_number", entry_type)
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
  store.commit("entries/save_entry", entry)
}


export function current_user_is_owner(store, entry) {
  return ld.find(entry.actors.owners, (o) => o.registered_name === store.state.user.user_data.registered_name)
}

export async function fetch_entry(store, axios, uuid) {
  let {data} = await axios.get("/entry/" + uuid);
  //console.log("fetched", data.result)
  store.commit("entries/save_entry", data.result)
  return data.result
}

export function find_aspect_with_name(arr, name) {
  return ld.find(arr, (a) => a.name === name)
}

export function findex_aspect_index_with_name(arr, name) {
  return ld.findIndex(arr, a => a.name === name)
}


// NEW FORMAT; with
/*
  TODO USE the store getter instead
  "&": ENTRY,
  "#": ASPECT,
  ".": INDEX,
  "_": COLLECT

  see aspect.js
 */
export function get_entry_value(entry, aspect_loc, store, is_location_array = false) {
  let select = entry.aspects_values
  if (!is_location_array) {
    aspect_loc = aspect_loc_str2arr(aspect_loc)
  }
  const final_loc = aspect_loc.pop()
  for (let loc of aspect_loc) {
    if (loc[0] === ASPECT) {
      select = select[loc[1]]
    } else if (loc[0] === INDEX) {
      select = select[parseInt(loc[1])]
    }
  }

  // TODO this is a temp hack, because aspect doesnt work for composites. cuz thez are not objects, but arrays
  // thats when its no composite
  if (aspect_loc.length === 0) {
    if (final_loc[0] === ASPECT) {
      return select[final_loc[1]]
    } else { // INDEX
      if (select.value.length === final_loc[1]) {
        return select.value[final_loc[1]]
      }
    }
  } else {
    if (final_loc[0] === ASPECT) {
      const comp_aspect = ld.find(select, a => a.name === final_loc[1])
      return comp_aspect
    }
  }
}

export function aspect_loc_str(aspect_loc) {
  // getting either "a" or "i", first letter
  // of all aspect_loc first index values and the 2nd value as string
  return ld.map(aspect_loc, al => al[0][0] + "-" + al[1]).join("_").replace(/[^_a-zA-Z0-9-]/g, "_")
}

export function get_type_slug_from(item_type) {
  // remove the $
  return item_type.substring(1)
}

export function has_parent(entry) {
  return entry.refs.parent
}

export function has_pages(entry_type) {
  return entry_type.content.meta.hasOwnProperty("pages")
}
