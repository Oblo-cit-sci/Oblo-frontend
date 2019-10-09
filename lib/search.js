import {PRIVATE, PRIVATE_LOCAL, PUBLIC} from "./consts";


const ld = require("lodash")

const NO_DOMAIN = "no_domain"

const PRIVACY_LEVELS = [PUBLIC, PRIVATE, PRIVATE_LOCAL]

const filter_methods = {
  domain: entries_domain_filter,
  privacy : entries_privacy_filter
}

export function entries_filter(entries, filter_options) {
  for (filter of filter_options) {
    entries = filter_methods[filter.filter](filter_options)
  }
}

export function entries_domain_filter(entries, {domains, include_no_domain=false}) {

  // todo check if string instead
  if (domains.constructor !== Array) {
    domains = [domains]
  }

  if (include_no_domain) {
    domains = ld.concat(domains, NO_DOMAIN)
  }

  return ld.filter(entries, e => {
    return ld.includes(domains, e.domain)
  })

}

export function entries_privacy_filter(entries, privacy_levels, only_given = false) {
  if (only_given) { // could be a string or an array
    if (privacy_levels.constructor !== Array) {
      privacy_levels = [privacy_levels]
    }

    return ld.filter(entries, e => {
      return ld.includes(privacy_levels, e.privacy)
    })
  } else { // should be a string
    return ld.filter(entries, e => {
      return PRIVACY_LEVELS.indexOf(e.privacy) <= privacy_levels
    })
  }
}
