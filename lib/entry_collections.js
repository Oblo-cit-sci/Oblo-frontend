import {filter_required} from "~/lib/search";
import {TYPE_SLUG} from "~/lib/consts";

import {entry_changes} from "~/lib/text";

const ld = require("lodash")

const Mustache = require("mustache")


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

