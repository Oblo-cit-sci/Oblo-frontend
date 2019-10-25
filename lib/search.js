import {PRIVATE, PRIVATE_LOCAL, PUBLIC, GLOBAL, NO_DOMAIN, ENTRY} from "./consts";
import {ENTRIES_ALL_ENTRIES_ARRAY, ENTRIES_VALUE} from "./store_consts";
import {aspect_loc_str2arr, loc_prepend} from "./aspect";

const levenshtein = require('fast-levenshtein')

const SIMILARITY_TRESH = 0.8

const ld = require("lodash")


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

  return ld.filter(entries, e => {
    return ld.includes(domains, e.domain)
  })
}

export function entries_domain_filter2(entries, domains, entrytypes, include_no_domain = false) {
  // todo check if string instead
  if (domains.constructor !== Array) {
    domains = [domains]
  }

  if (include_no_domain) {
    domains = ld.concat(domains, NO_DOMAIN)
  }

  const etype_domain_map = {}
  entrytypes.forEach(et => {
    etype_domain_map[et.slug] = et.domain
  })

  return ld.filter(entries, e => {
    return ld.includes(domains, etype_domain_map[e.type_slug])
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

export function levensthein_ratio(word1, word2) {
  return (1 - levenshtein.get(word1, word2) / Math.max(word1.length, word2.length))
}

export function check_match(value, keyword) {
  //console.log(value, keyword, value.includes(keyword),levensthein_ratio(value, keyword))
  return value.includes(keyword) || (levensthein_ratio(value, keyword) > SIMILARITY_TRESH)
}

export function compare_value(value, keyword) {
  if (typeof value === "string") {
    console.log(value.toLowerCase())  
    return check_match(value.toLowerCase(), keyword.toLowerCase())
  } else if (value.constructor === Array) {
    for (let index_val of value) {
   //   console.log(index_val.value, keyword, check_match(index_val.value, keyword))
      if (check_match(index_val.value.toLowerCase(), keyword.toLowerCase())) {
        return true
      }
    }
  } else {
    console.log("ERROR search.compare_aspect_value unknown type")
    return false
  }
}

export async function local_search(store, search_config) {
  const entries = store.getters[ENTRIES_ALL_ENTRIES_ARRAY]()

  let req_filtered_entries = []
  let include_results = []
  /**
   * Default search by domain
   */
  for (let entry of entries) {
    const etype = store.getters["entry_type"](entry)
    if (compare_value(etype.domain, search_config.required.domain)) {
      req_filtered_entries.push([entry.uuid, entry])
    }
  }
  // TODO not the best approach in the end. but otherwise, no filter no results...
  if (ld.isEmpty(search_config.include)) {
    return req_filtered_entries
  }
  /**
   * Search by keyword
   */
  for (let entry of req_filtered_entries) {
    let entry_value = entry[1]

    if (search_config.include.title) {
      if (compare_value(entry_value.title, search_config.include.title)) {
        include_results.push([entry_value.uuid, entry_value])
        continue
      }
    }

    if (search_config.include.tags) {
      const tags = entry_value.tags || []
      let match = false
      for (let tag of tags) {
        if (compare_value(tag, search_config.include.tags)) {
          include_results.push([entry_value.uuid, entry_value])
          match = true
          break
        }
      }
      if (match) {
        continue
      }
    }

    if (search_config.include.aspect_search) {
      const etype = store.getters["entry_type"](entry_value)
      if (etype.content.meta.hasOwnProperty("search_in")) {
        const search_in = etype.content.meta.search_in
        for (let aspect_loc_str of search_in) {
          const aspect_loc = loc_prepend(ENTRY, entry_value.uuid, aspect_loc_str2arr(aspect_loc_str))
          const value = store.getters[ENTRIES_VALUE](aspect_loc)
          if (value && compare_value(value.value, search_config.include.aspect_search)) {
            include_results.push([entry_value.uuid, entry_value])
          }
        }
      }
    }
  }

  return include_results
}
