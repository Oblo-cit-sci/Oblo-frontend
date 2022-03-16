import {DRAFT, EDITOR, REQUIRES_REVIEW, VISITOR} from "./consts";
import {ADMIN} from "~/lib/consts"

const ld = require("lodash")

export function user_ref({registered_name, public_name}) {
  return {registered_name, public_name}
}

// TODO fix, make simpler, maybe move to const
// this comes from the server
export const CREATOR = "creator"
export const REVIEWER = "reviewer"
export const COLLABORATOR = "collaborator"
export const SHARED = "shared"

export const ROLE_ICONS = {
  [CREATOR]: "mdi-file-edit-outline",
  [REVIEWER]: "mdi-file-document-box-check-outline",
  [COLLABORATOR]: "mdi-pencil",
  [SHARED]: "mdi-eye-outline"
}

export const ordered_entry_roles = [CREATOR, REVIEWER, COLLABORATOR, SHARED]

export const editing_roles = [CREATOR, COLLABORATOR, REVIEWER]

/**
 * check if an actor can edit an entry.
 * One condition needs to be met:
 * 1.entry is a draft
 * 2. actor is admin,
 * 3. entry requires review, and the actor is a editor for the domain and language
 * 4. actor is in a editing role for the entry [CREATOR, COLLABORATOR, REVIEWER]
 * @param actor
 * @param entry
 * @returns {boolean}, true if the actor can edit the entry
 */
export function can_edit_entry(actor, entry) {
  if(entry.status === DRAFT) {
    return true
  }
  if (actor.global_role === ADMIN) {
    return true
  } else if (entry.status === REQUIRES_REVIEW
    && actor.global_role === EDITOR
    && actor.config_share.editor.domain.includes(entry.domain)
    && actor.config_share.editor.language.includes(entry.language)) {
    return true
  } else if (actor.global_role === VISITOR) {
    return false
  }
  const actors = entry.actors
  for (let actor_role of actors) {
    if (actor_role.actor.registered_name === actor.registered_name)
      return editing_roles.includes(actor_role.role)
  }
}

/**
 * check if the actor is an oauth user (todo refactor, not make it based on the name)
 * @param actor
 * @returns {*}
 */
export function is_oauth(actor) {
  return actor.registered_name.startsWith("oauth_")
}

/**
 * check if the actor is a registered user or a visitor (VISITOR)
 * @param user
 * @returns {boolean}
 */
export function is_visitor(user) {
  return user.global_role === VISITOR
}
