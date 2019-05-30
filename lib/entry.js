const ld = require("lodash")

export function aspect_default_value(aspect) {
  if(aspect.type.startsWith("!")) {
    return aspect.default
  }
  switch (aspect.type) {
    case "str":
      return ""
    case "int":
      // todo could also check attr.min
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
      console.log(">" , aspect.name, default_values)
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

  let entry = new Entry({
    entry_type: entry_type,
    draft_id: draft_id,
    license:  store.state.user.user_data.defaultLicense,
    privacy: store.state.user.user_data.defaultPrivacy,
  })
  // todo maybe some redundant data here...
  store.commit("edrafts/create_draft", entry.get_store_data())

  return draft_id
}

// not sure if this class is actually usefull..
export default class Entry {

  constructor(init) {
    this.entry_type = init.entry_type // maybe out later...
    this.type_slug = init.entry_type.slug
    this.draft_id = init.draft_id
    this.entry_id = init.entry_id || init.draft_id // until its submitted
    this.aspects_values = init.aspects_values || this.default_values()
    this.license = init.license
    this.privacy = init.privacy
    this.title = init.title || this.get_draft_title()
    this.ref = null
    this.version = 0
  }

  get_draft_title() {
    return Entry.draft_title(this.entry_type.title, this.aspects_values.title, this.draft_id)
  }

  static draft_title(entry_type_title, title_aspect, draft_id) {
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

  get_store_data() {
    return {
      type_slug: this.type_slug,
      title: this.title,
      draft_id:  this.draft_id,
      entry_id: this.draft_id, // until its submitted
      aspects_values: this.aspects_values,
      license: this.license,
      privacy: this.privacy,
      ref: this.ref
    }
  }

  default_values() {
    let values = {}
    let aspects = this.entry_type.content.aspects
    for(let aspect_i in aspects) {
      let aspect = aspects[aspect_i]
      values[aspect.name] = aspect_default_value(aspect)
    }
    //console.log("DVals", values)
    return values
  }

}
