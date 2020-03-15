import {filter_required} from "~/lib/search";
import {TYPE_SLUG} from "~/lib/consts";
import {ENTRIES_ALL_ENTRIES_ARRAY} from "~/store/entries";

const ld = require("lodash")

export function sort_by_type(entries) {
  let result = {}
  for (let e of entries) {
    if (!result.hasOwnProperty(e.type_slug)) {
      result[e.type_slug] = []
    }
    result[e.type_slug].push(e)
  }
  return result
}


export function entries_map(entries) {
  return ld.keyBy(entries, e => e.uuid)
}

export function temp_type_icon(type_slug) {
  switch (type_slug) {
    case "site": return "mdi-texture-box"
    case "village": return "mdi-home-group"
    case "household_survey": return "mdi-home-variant-outline"
    case "seasonal_calendar": return "mdi-calendar-range-outline"
    case "observation_&_licci": return "mdi-eye-outline"
    case "adaptation_and_coping_strategy": return "mdi-tools"
    case "crop_diversity_system": return "mdi-palm-tree"
    case "field_type": return "mdi-flower-tulip-outline"
    case "individual_survey": return "mdi-account-outline"
    case "crop_diversity_survey": return "mdi-clipboard-account-outline"
    default: {
      console.log(type_slug)
      return "mdi-microscope"
    }
  }
}

export function entries2vuetify_tree(entries, templates, add_outdated) {
  const items = []
  const entry_map = entries_map(entries)
  // console.log("tree with", entries, entry_map)
  const rec_item = (uuid) => {
    const e = entry_map[uuid] || null
    if (!e)
      return null

    const item = {
      name: e.title,
      id: e.uuid,
      uuid: e.uuid,
      icon: temp_type_icon(e.type_slug)
    }

    const children = Object.keys(e.refs.children)
    const child_items = []
    if (add_outdated) {
      if (templates[e.type_slug])
        item.outdated = (e.parent_type_version || 0) !== templates[e.type_slug].version
    }
    for (let child_uuid of children) {
      const child_item = rec_item(child_uuid)
      if (child_item)
        child_items.push(child_item)
    }
    if (child_items.length > 0)
      item.children = child_items

    return item
  }

  for (let e of entries) {
    if (!e.refs.parent) {
      items.push(rec_item(e.uuid))
    }
  }
  return items
}

export function get_entries_of_type(store, type_slug){
  return filter_required(store.getters[ENTRIES_ALL_ENTRIES_ARRAY](), [
    {
      name: "meta_aspect",
      meta_aspect_name: TYPE_SLUG,
      conditional_value: type_slug
    }
  ])
}
