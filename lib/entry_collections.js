import {filter_required} from "~/lib/search";
import {TYPE_SLUG} from "~/lib/consts";
import {ENTRIES_ALL_ENTRIES_ARRAY} from "~/store/entries";
import {entry_changes} from "~/lib/text";

const ld = require("lodash")

const Mustache = require("mustache")

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
    case "site":
      return "mdi-texture-box"
    case "village":
      return "mdi-home-group"
    case "household_survey":
      return "mdi-home-variant-outline"
    case "seasonal_calendar":
      return "mdi-calendar-range-outline"
    case "observation_&_licci":
      return "mdi-eye-outline"
    case "adaptation_and_coping_strategy":
      return "mdi-tools"
    case "crop_diversity_system":
      return "mdi-palm-tree"
    case "field_type":
      return "mdi-flower-tulip-outline"
    case "individual_survey":
      return "mdi-account-outline"
    case "crop_diversity_survey":
      return "mdi-clipboard-account-outline"
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
        item.outdated = (e.template_version || 0) !== templates[e.type_slug].version
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

export function get_entries_of_type(store, type_slug) {
  return filter_required(store.getters[ENTRIES_ALL_ENTRIES_ARRAY](), [
    {
      name: "meta_aspect",
      meta_aspect_name: TYPE_SLUG,
      conditional_value: type_slug
    }
  ])
}

export function compare_entries(entry1, entry2, ignore=[]) {

  // ld.isEqual(entry1.tags, entry2.tags)
  // location
  const results = []
  const simple_meta_aspects = ["privacy", "license"]
  for(let m_aspect of simple_meta_aspects) {
    if (entry1[m_aspect] !== entry2[m_aspect]) {
      results.push(Mustache.render(entry_changes[m_aspect], {old: entry1[m_aspect], new: entry2[m_aspect]}))
    }
  }
  for(let new_role of entry2.actors) {
    if(!entry1.actors.some(ar => ar.actor.registered_name === new_role.actor.registered_name && ar.role === new_role.role)) {
      results.push(Mustache.render(entry_changes.role_added, {actor: new_role.actor.public_name, role: new_role.role }))
    }
  }
  for(let removed_role of entry1.actors) {
    if(!entry2.actors.some(ar => ar.actor.registered_name === removed_role.actor.registered_name && ar.role === removed_role.role)) {
      results.push(Mustache.render(entry_changes.role_removed, {actor: removed_role.actor.public_name, role: removed_role.role }))
    }
  }
  if(!ignore.includes("values")) {
    for (let value_name in entry1.values) {
      if (!ld.isEqual(entry1.values[value_name], entry2.values[value_name])) {
        results.push(Mustache.render(entry_changes.aspect_change, {name: value_name}))
      }
    }
  }
  return results
}
