import {DRAFT, PRIVATE_LOCAL} from "./consts";

const ld = require("lodash")
const uuidv4 = require('uuid/v4');

export function aspect_default_value(aspect) {
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
      console.log("aspect composite default", aspect)
      let default_values = ld.map(aspect.components, (c) => aspect_default_value(c))
      console.log(">", aspect.name, default_values)
      return default_values
    case "select":
      return null
    default:
      console.log("Warning trying to ge default value of aspect of unknown type", aspect)
      return null
  }
}

export function create_and_store(type_slug, store) {
  let entry_type = store.getters.entry_type(type_slug)
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

  let entry = create_entry({
    entry_type: entry_type,
    draft_id: draft_id,
    license: store.state.user.user_data.defaultLicense,
    privacy: store.state.user.user_data.defaultPrivacy,
  })
  // todo maybe some redundant data here...
  store.commit("edrafts/create_draft", entry)

  return draft_id
}


export function create_entry(init) {
  return {
    //entry_type: init.entry_type, // maybe out later...
    type_slug: init.entry_type.slug,
    draft_id: init.draft_id,
    aspects_values: init.aspects_values || default_values(init.entry_type),
    license: init.license,
    privacy: init.privacy,
    title: init.title || draft_title(init.entry_type.title, "", init.draft_id),
    ref: null,// todo rename to parent
    status: DRAFT,
    version: 0
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
    values[aspect.name] = aspect_default_value(aspect)
  }
  //console.log("DVals", values)
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
    entry.version = entry.version + 1;
  }
  store.commit("edrafts/save_draft", entry)
}

export function save_entry(store, entry) {
  if (!entry.local_id) {
    entry.local_id = uuidv4()
    entry.version = 0
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

export function get_local_entry(store, ref) {
  if(ref.draft_id) {
    return store.state.edrafts.drafts[ref.draft_id]
  } else if(ref.local_id) {
    return store.state.entries.own_entries.get(ref.local_id)
  } else
    console.log("ERROR CANNOT GET locel entry", ref)
}

export function get_id(store, ref) {
  const entry = get_local_entry(store, ref)
  if(entry.draft_id)
    return entry.draft_id
  else if(entry.local_id)
    return entry.local_id
  else if(entry.id)
    return entry.id
  console.log("ERROR NO ID", ref)
}

export function get_edit_route_for_ref(store, ref) {
  const entry = get_local_entry(store, ref)
  if(entry.draft_id)
    return "/create/" + entry.type_slug + "/" + entry.draft_id
  else if(entry.local_id)
    return "/edit/" + entry.local_id
  else if(entry.id)
    // todo // axios get
    return entry.id
  console.log("ERROR NO ID", ref)
}

export function delete_local_entry(store, ref) {
  const entry = get_local_entry(store, ref)
  if(entry.draft_id)
    return store.commit("edrafts/remove_draft", entry.draft_id)
  else if(entry.local_id)
    return store.commit("entries/remove_entry", entry.local_id)
}
