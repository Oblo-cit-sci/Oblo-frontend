import {PRIVATE, PRIVATE_LOCAL, PUBLIC, GLOBAL} from "./consts";


const ld = require("lodash")

const NO_DOMAIN = "no_domain"

const PRIVACY_LEVELS = [PUBLIC, PRIVATE, PRIVATE_LOCAL]

const filter_methods = {
  domain: entries_domain_filter,
  privacy: entries_privacy_filter,
  global: global_context_filter
}

export function entries_filter(entries, filter_options) {
  for (filter of filter_options) {
    entries = filter_methods[filter.filter](filter_options)
  }
  return entries
}

/**
 * Filter an array of entrytype entries
 * @param entries
 * @returns {*}
 */
export function global_context_filter(entries) {
  return ld.filter(entries, e => e.content.meta.context === GLOBAL)
}

export function entries_domain_filter(entries, domains, include_no_domain = false) {

  // todo check if string instead
  if (domains.constructor !== Array) {
    domains = [domains]
  }

  if (include_no_domain) {
    domains = ld.concat(domains, NO_DOMAIN)
  }
  ld.filter(entries, e => {
    return ld.includes(domains, e.domain)
  })

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

export function has_meta_aspect(entries, meta_aspect_name, conditional_value) {
  ld.filter(entries, e => {
    // move everything to meta!
    if (e.hasOwnProperty(meta_aspect_name)) {
      return !!(conditional_value && e[meta_aspect_name] === conditional_value)
    } else
      return false
  })
}
