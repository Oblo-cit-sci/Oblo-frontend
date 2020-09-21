import {EDITOR, REQUIRES_REVIEW, VISITOR} from "./consts";
import {ADMIN} from "~/lib/consts"

const ld = require("lodash")

export function user_ref(user_data) {
  return {
    registered_name: user_data.registered_name,
    public_name: user_data.public_name
  }
}

// TODO fix, make simpler, maybe move to const
// this comes from the server
export const CREATOR = "creator"
export const REVIEWER = "reviewer"
export const COLLABORATOR = "collaborator"
export const SHARED = "shared"

export const ordered_entry_roles = [CREATOR, REVIEWER, COLLABORATOR, SHARED]

export const editing_roles = [CREATOR, COLLABORATOR] // not REVIEWER, only when its in requires_review state

// export function can_edit(entry, actor) {
//   if (actor.global_role === ADMIN) {
//     return true
//   }
//   const actors = entry.actors
//   for (let actor_roles of actors) {
//     if (actor_roles.actor.registered_name === actor.registered_name)
//       return editing_roles.includes(actor_roles.role)
//   }
// }

export function can_edit_entry(actor, entry) {
  if (actor.global_role === ADMIN) {
    return true
  } else if (entry.status === REQUIRES_REVIEW
    && actor.global_role === EDITOR && actor.config_share.editor_domain === entry.domain) {
    return true
  } else if (actor.global_role === VISITOR) {
    return false
  }
  const actors = entry.actors
  for (let actor_roles of actors) {
    if (actor_roles.actor.registered_name === actor.registered_name)
      return editing_roles.includes(actor_roles.role)
  }
}
