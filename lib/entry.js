import {DRAFT, PRIVATE_LOCAL} from "./consts"

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

const ld = require("lodash")
const uuidv4 = require('uuid/v4')


// todo use another function for clearAlt to keep this fct cleaner
export function MAspectComponent(aspect, ignore_page = false, clearAlt = false) {
  //console.log("select Aspect component for ", aspect)
  let attr = aspect.attr || {}
  let view = attr.view || "inline"

  if (view === "page" && !ignore_page) {
    return AspectPageButton
  } else if (view === "inline" || ignore_page) {
    if (aspect.type === "str") {
      let max = aspect.attr.max || 8000 // or make this explicit in python
      if (max < 100) {
        if (clearAlt) {
          return TextShort_appendButton
        } else {
          return TextShort
        }
      } else {
        return TextLong
      }
    } else if (aspect.type === "url") {
      return UrlAspect
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
      return CompositeAspect
    } else if (aspect.type === "options") {
      return OptionsAspect
    } else if (aspect.type === "select") {
      return Select
    } else if (aspect.type === "tree") {
      return TreeSelect
    } else if (aspect.type.startsWith("!")) {
      return aspect.type.substring(1)
    }
  }
  console.log("No Aspect component for",aspect.name, aspect.type, aspect.type === "options")
  return Basic
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
      return {}
    case "composite":
      return ld.map(aspect.components, (c) => aspect_wrapped_default_value(c))
    case "options":
      return aspect_wrapped_default_value(aspect.options[0])
    case "select":
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
  let draft_id = store.state.edrafts.next_id

  for (let aspect_i in aspects) {
    let aspect = aspects[aspect_i]
    // todo this happens already in MAspectComponent
    aspect.attr = aspect.attr || {}
    if ((aspect.attr.view || "inline") === "page") {
      aspect.attr.draft_id = this.draft_id
      aspect.attr.aspect_index = aspect_i
    }
  }

  let entry = create_entry(store.state.user.user_data, {
    entry_type: entry_type,
    draft_id: draft_id
  })

  store.commit("edrafts/create_draft", entry)
  if (ref) {
    store.commit("edrafts/add_reference", {draft_id: draft_id, ref: ref})
  }
  return draft_id
}


export function create_entry(user_data, init) {
  // todo different owner in case of visitor
  return {
    //entry_type: init.entry_type, // maybe out later...
    type_slug: init.entry_type.slug,
    draft_id: init.draft_id,
    aspects_values: init.aspects_values || default_values(init.entry_type),
    license: user_data.defaultLicense,
    privacy: user_data.defaultPrivacy,
    title: init.title || draft_title(init.entry_type.title, "", init.draft_id),
    ref: null,// todo rename to parent
    status: DRAFT,
    version: 0,
    users: {owners: [user_data.registered_name]}
  }
}


export function get_draft_title(entry) {
  return draft_title(entry.entry_type.title, entry.aspects_values.title, entry.draft_id)
}

export function draft_title(entry_type_title, title_aspect, draft_id) {
  let title = entry_type_title + ": "
  let title_value = title_aspect
  // todo simplify after aspects_value defaults...
  if (title_value === "") {
    title += draft_id
  } else {
    title += title_value
  }
  return title
}


export function default_values(entry_type) {
  let values = {}
  let aspects = entry_type.content.aspects
  for (let aspect_i in aspects) {
    let aspect = aspects[aspect_i]
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
  if (entry.hasOwnProperty("draft_id")) {
    save_draft(store, entry)
  } else {
    save_entry(store, entry)
  }
}


export function save_draft(store, entry, version_increase = false) {
  if (version_increase) {
    entry.version = entry.version + 1
  }
  store.commit("edrafts/save_draft", entry)
}

export function save_entry(store, entry) {
  if (!entry.local_id) {
    entry.local_id = uuidv4()
    entry.version = 1
  } else {
    entry.version = entry.version + 1
  }
  if (entry.draft_id) {
    entry.status = PRIVATE_LOCAL
    delete_draft(store, entry)
  }
  store.commit("entries/save_entry", entry)
}

export function delete_draft(store, entry) {
  store.commit("edrafts/remove_draft", entry.draft_id)
  delete entry.draft_id
}

export function delete_entry(store, entry) {
  store.commit("entries/remove_entry", entry.local_id)
}

export function get_local_entry(store, ref) {
  if (ref.draft_id) {
    return store.state.edrafts.drafts[ref.draft_id]
  } else if (ref.local_id) {
    return store.state.entries.own_entries.get(ref.local_id)
  } else
    console.log("ERROR CANNOT GET locel entry", ref)
}

export function get_id(store, ref) {
  const entry = get_local_entry(store, ref)
  if (entry.draft_id)
    return entry.draft_id
  else if (entry.local_id)
    return entry.local_id
  else if (entry.id)
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

// todo rename to entry_ref_id
export function entry_ref(entry) {
  if (entry.draft_id)
    return {draft_id: entry.draft_id}
  else if (entry.local_id)
    return {local_id: entry.local_id}
  else if (entry.id)
    return {id: entry.id}
  console.log("entry.entry_ref ERROR NO ID", entry)
}

export function get_edit_route_for_ref(store, ref) {
  const entry = get_local_entry(store, ref)
  if (entry.draft_id)
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

