import {DRAFT, EDIT, PRIVATE_LOCAL, VIEW} from "./consts"

import Basic from "../components/aspectInput/Basic"
import TextShort from "../components/aspectInput/TextShort"
import TextLong from "../components/aspectInput/TextLong"
import NumberAspect from "../components/aspectInput/NumberAspect"
import DateAspect from "../components/aspectInput/DateAspect"
import Location from "../components/aspectInput/Location"


import List from "../components/aspectInput/List"
import ListOf from "../components/aspectInput/ListOf"
import AspectPageButton from "../components/aspectInput/AspectPageButton"
import TextShort_appendButton from "../components/aspectInput/TextShort_appendButton"

import Map from "../components/aspectInput/Map"
import CompositeAspect from "../components/aspectInput/CompositeAspect"
import OptionsAspect from "../components/aspectInput/OptionsAspect";

import Select from "../components/aspectInput/Select"
import TreeSelect from "../components/aspectInput/TreeSelect"
import MultiSelect from "../components/aspectInput/MultiSelectAspect";
import UrlView from "../components/aspectInput/composite_views/UrlView";

const ld = require("lodash")
const uuidv4 = require('uuid/v4')



export function MAspectComponent(aspect, ignore_page = false, mode = EDIT) {
  //console.log(aspect, ignore_page, mode)
  //console.log("select Aspect component for ", aspect)
  let attr = aspect.attr || {}
  let view = attr.view || "inline"

  if (view === "page" && !ignore_page) {
    return AspectPageButton
  } else if (view === "inline" || ignore_page) {
    if (aspect.type === "str") {
      let max = aspect.attr.max || 8000 // or make this explicit in python
      if (max < 100) {
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
    } else if (aspect.type === "map") {
      return Map
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


export function aspect_default_value(aspect) {
  //console.log("aspect_default_value", aspect.name, aspect)
  if (aspect.type.startsWith("!")) {
    return aspect.default
  }
  switch (aspect.type) {
    case "str":
      return ""
    case "int":
      // todo could also check attr.min
      return 0
    case "float":
      return 0
    case "@user":
      return null
    case "date":
      // TODO now?
      return new Date()
    case "gps":
      return null
    case "list":
      return []
    case "map":
      return []
    case "tree":
      return null
    case "composite":
      return ld.map(aspect.components, (c) => aspect_wrapped_default_value(c))
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
}

export function aspect_wrapped_default_value(aspect) {
  return {value: aspect_default_value(aspect)}
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
  store.commit("entries/create", entry, )
  if (ref) {
    store.commit("entries/set_ref_parent", {uuid: entry.uuid, ref: ref})
  }
  return entry
}


export function create_entry(store, type_slug, init = {}) {
  // todo different owner in case of visitor

  const entry_type = store.getters.entry_type(type_slug);
  const draft_no = store.state.entries.draft_no
  const user_data = store.state.user.user_data
  //let aspects = entry_type.content.aspects;

  return {
    //entry_type: init.entry_type, // maybe out later...
    type_slug: type_slug,
    draft_no: draft_no,
    aspects_values: init.aspects_values || default_values(entry_type),
    license: user_data.defaultLicense,
    privacy: user_data.defaultPrivacy,
    title: entry_type.title + " " + draft_no,
    //ref: null,// todo rename to parent
    refs: {
      parent: null,
      children: []
    }, // ne
    status: DRAFT,
    uuid: uuidv4(),
    version: 0,
    actors: {
      owners: [{
        registered_name: user_data.registered_name,
        username: user_data.public_name
      }]
    }
  }
}


export function get_draft_title(entry) {
  return draft_title(entry.entry_type.title, entry.aspects_values.title, entry.draft_id)
}


export function default_values(entry_type) {
  let values = {}
  let aspects = entry_type.content.aspects
  for (let aspect_i in aspects) {
    let aspect = aspects[aspect_i]
    //console.log("lib/entry: default value of aspect", aspect)
    if (aspect.attr.value) {
      values[aspect.name] = {value: aspect.attr.value}
    } else {
      values[aspect.name] = aspect_wrapped_default_value(aspect)
    }
  }
  // console.log("D vals", values)
  return values
}

export function autosave(store, entry) {
    save_entry(store, entry, false)
}

export function save_entry(store, entry, increase_version) {
  if(increase_version) {
    entry.version = entry.version + 1
  }
  create_title(store, entry)
  store.commit("entries/save_entry", entry)
}

export function delete_entry(store, entry) {
  store.commit("entries/remove_entry", entry.local_id)
}


export function get_id(store, ref) {
  const entry = get_local_entry(store, ref)
  if (entry.draft_id !== undefined)
    return entry.draft_id
  else if (entry.local_id !== undefined)
    return entry.local_id
  else if (entry.id !== undefined)
    return entry.id
  console.log("entry.get_id ERROR NO ID", ref)
}

export function get_ref_aspect(aspect) {
  const is_list = aspect.type === "list"
  if (is_list) {
    return {aspect: aspect.items, list: true}
  } else {
    return {aspect: aspect, list: false}
  }
}

/*
export function build_entry_ref_for_aspect(entry, aspect) {
  const ref_id = entry_ref(entry)

  let aspect_to_check = aspect
  const is_list = aspect.type === "list"
  // todo eventually also components, or options
  if (is_list) {
    aspect_to_check = aspect.items
  }

  if (typeof (aspect_to_check) === "string") {
    // ******** CONTEXT_ENTRY
    if (aspect_to_check[0] === "$") {
      const new_type_slug = aspect_to_check.substring(1)
      let ref_data = {
        draft_id: this.draft_id,
        aspect_name: aspect.name,
        //type_slug: this.entry.type_slug
      }
      if (is_list) {
        ref_data.index = this.entry.aspects_values[aspect.name].value.length
      }


    }
  }
}*/


export function get_edit_route_for_ref(store, ref) {
  const entry = get_local_entry(store, ref)
  if (entry.draft_id !== undefined)
    return "/create/" + entry.type_slug + "/" + entry.draft_id
  else if (entry.local_id)
    return "/edit/" + entry.local_id
  else if (entry.id)
  // todo // axios get
    return entry.id
  console.log("entry.get_edit_route_for_ref ERROR NO ID", ref)
}

export function delete_local_entry(store, ref) {
  const entry = get_local_entry(store, ref)
  if (entry.draft_id)
    return store.commit("edrafts/remove_draft", entry.draft_id)
  else if (entry.local_id)
    return store.commit("entries/remove_entry", entry.local_id)
}

export function current_user_is_owner(store, entry) {
  return ld.find(entry.actors.owners, (o) => o.registered_name === store.state.user.user_data.registered_name)
}

export async function fetch_entry(store, axios, uuid) {
  let {data} = await axios.get("/entry/" + uuid);
  //console.log("fetched", data);
  let entry = data.result
  //console.log("entry", entry)

  if (current_user_is_owner(store, entry)) {
    console.log("fetched entry that is already own...", entry.title)
    //store.commit("entries/add_own_entry", entry)
  }
  {
    store.commit("entries/add_fetched_entry", entry)
  }
  return entry
}

export function find_aspect_with_name(arr, name) {
  return ld.find(arr, (a) => a.name === name)
}

export function findex_aspect_index_with_name(arr, name) {
  return ld.findIndex(arr, a => a.name === name)
}

// todo probably deprecated, see submit in EntryAction...
// instead pack multiple entries to send...
/*
export function fill_in_child_refs_for_sending(store, entry) {
  console.log("lib/entry.fill_in_child_refs_for_sending")
  for(let ref of entry.refs.children) {
    const the_ref = store.getters["entries/get_entry"](ref.local_id)
    console.log("ref > ", ref, the_ref)
    // TODO this will only work for Article Observation
    // fill into the simply named aspect with index
    console.log(entry)
    // this simple localization of the ref.aspect_ref
    entry.aspects_values[ref.aspect_ref].value[ref.index] = the_ref
  }
  return entry
}
*/

export function create_title(store, entry) {
  const etype = store.getters.entry_type(entry.type_slug)
  const type_aspects = etype.content.aspects
  // could be marked another aspect (str)
  const title_names = type_aspects[0].name
  let title = entry.aspects_values[title_names].value
  if(title === "") {
    title = etype.title
  }
  entry.title = title
}
