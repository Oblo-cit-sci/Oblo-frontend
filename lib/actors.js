import {VISITOR} from "./consts";

const ld = require("lodash")


export function user_ref(user_data) {
  const ref = {
    registered_name: user_data.registered_name,
    public_name: user_data.public_name
  }
  // if (user_data.global_role === VISITOR) {
  //   ref.uid = user_data.uid
  // }
  return ref
}

// TODO fix, make simpler, maybe move to const
export const CREATOR = {key: "CREATOR", actors_key: "creator"}
export const PRIME_OWNER = {key: "PRIME_OWNER", actors_key: "owners"}
export const OWNERS = {key: "OWNERS", actors_key: "owners"}
export const REVIEWERS = {key: "REVIEWERS", actors_key: "reviewers"}
export const EXPLICIT_ACCESS = {key: "EXPLICIT_ACCESS", actors_key: "explicit_access"}
export const COLLABORATOR = {key: "COLLABORATOR", actors_key: "collaborator"}
const ActorEntryRelations = [OWNERS, EXPLICIT_ACCESS, COLLABORATOR]

export function entry_actor_relation(entry, user) {
  if(user.registered_name === VISITOR) {
    return VISITOR
  }
  const actors = entry.actors
  for(let actor_roles of actors) {
    if(actor_roles.actor.registered_name === user.registered_name)
      return actor_roles.role
  }
  return VISITOR

}
