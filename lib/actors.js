import {VISITOR} from "./consts";

const ld = require("lodash")

export function user_ref(user_data) {
  return {
    registered_name: user_data.registered_name,
    public_name: user_data.public_name
  }
}

// TODO fix, make simpler, maybe move to const
// this comes from the server
export const CREATOR = {key: "CREATOR", actors_key: "creator"}
export const PRIME_OWNER = {key: "PRIME_OWNER", actors_key: "owners"}
export const OWNERS = {key: "OWNERS", actors_key: "owners"}
export const REVIEWERS = {key: "REVIEWERS", actors_key: "reviewers"}
export const EXPLICIT_ACCESS = {key: "EXPLICIT_ACCESS", actors_key: "explicit_access"}
export const COLLABORATOR = {key: "COLLABORATOR", actors_key: "collaborator"}
export const VIEWER = {key: "COLLABORATOR", actors_key: "collaborator"}

const ActorEntryRelations = [OWNERS, EXPLICIT_ACCESS, COLLABORATOR]

const editing_roles = ["creator", "owners"]

export function entry_actor_relation(entry, user) {
  if (user.registered_name === VISITOR) {
    return VISITOR
  }
  const actors = entry.actors
  for (let actor_roles of actors) {
    if (actor_roles.actor.registered_name === user.registered_name)
      return actor_roles.role
  }
  return VISITOR
}

export function can_edit(entry, actor) {
  // if (actor.registered_name === VISITOR) {
  //   return VISITOR
  // }
  const actors = entry.actors
  for (let actor_roles of actors) {
    if (actor_roles.actor.registered_name === actor.registered_name)
      return editing_roles.includes(actor_roles.role)
  }
}
