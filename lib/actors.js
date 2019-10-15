import {VISITOR} from "./consts";

const ld = require("lodash")


export function user_ref(user_data) {
  let ref = {
    registered_name: user_data.registered_name,
    public_name: user_data.public_name
  }
  if (user_data.global_role === VISITOR) {
    ref.uid = user_data.uid
  }
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
  let identity = (eu) => {
    return user.global_role !== VISITOR ?
      eu.registered_name === user.registered_name :
      eu.uid === user.uid
  }
  const actors = entry.actors
  if (identity(actors.creator))
    return CREATOR.key
  else {
    for (let ae_relation of ActorEntryRelations) {
      let in_group = ld.findIndex((actors[ae_relation.key] || []), (e_a) => identity(e_a))
      if (in_group !== -1)
        if (ae_relation.key === OWNERS.key && in_group === 0) {
          return PRIME_OWNER.key
        } else {
          return ae_relation.key
        }
    }
  }
}
