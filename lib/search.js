import {ENTRY, GLOBAL, NO_DOMAIN, PRIVATE, PRIVATE_LOCAL, PUBLIC} from "./consts";
import {aspect_loc_str2arr, loc_prepend} from "./aspect";


const levenshtein = require('fast-levenshtein')

const LOG = false

const SIMILARITY_TRESH = 0.8

const ld = require("lodash")


const PRIVACY_LEVELS = [PUBLIC, PRIVATE, PRIVATE_LOCAL]

const filter_methods = {
  domain: entries_domain_filter,
  privacy: entries_privacy_filter,
  global: global_context_filter,
  meta_aspect: has_meta_aspect,
  entry_type: null
}

export function filter_entries(entries, filter_config) {
  const filter_method = filter_methods[filter_config.name]
  return entries.filter(e => filter_method(e, filter_config))
}

/**
 * Filter an array of entrytype entries
 * @param entries
 * @returns {*}
 */
export function global_context_filter(entries) {
  return ld.filter(entries, e => e.rules.context === GLOBAL)
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

// TODO should be depr. keep domain in all entries as meta_aspect, simply check
// for all make a select all = dont filter, and multifilter
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

export function has_meta_aspect(entry, {meta_aspect_name, value, compare}) {
  // console.log("has_meta_aspect", entry.title, meta_aspect_name, value)
  // console.log(entry)
  // console.log(entry.hasOwnProperty(meta_aspect_name))
  if (entry.hasOwnProperty(meta_aspect_name)) {
    if(!value)
      return true
    else {
      if(compare && compare === "unequal") {
        return entry[meta_aspect_name] !== value
      } else {
        return entry[meta_aspect_name] === value
      }
    }
  } else
    return false
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

export function filter_required(entries, required_config) {
  let filtered_entries = entries
  for (let required of required_config) {
    // console.log("required", required)
    // console.log("filter method:", filter_methods[required.name])
    filtered_entries = filter_entries(filtered_entries, required)
  }
  return filtered_entries
}

export async function local_search(store, search_config) {
  const entries = store.getters["entries/all_entries_array"]()

  if (LOG) {
    console.log("search.local_search: entries:", entries.length, "config:", search_config)
  }

  let req_filtered_entries = []
  let include_results = []

  //console.log("local search")
  req_filtered_entries = filter_required(entries, search_config.required)

  req_filtered_entries = req_filtered_entries.map(e => ([e.uuid, e]))

  /**
   * Default search by domain
   */
  /*
  if (search_config.required.domain !== NO_DOMAIN) {

    for (let entry of entries) {

      const etype = store.getters["templates/entry_type"](entry.type_slug)
      if (!etype) {
        console.log("warning. etype missing", entry.type_slug)
        continue
      }
      if (compare_value(etype.domain, search_config.required.domain)) {
        req_filtered_entries.push([entry.uuid, entry])
      }
      if (LOG) {
        console.log("search.local_search: domain filter: ",
          search_config.required.domain, "entries:", req_filtered_entries.length)
      }
    }
  } else {
    req_filtered_entries = entries.map(e => ([e.uuid, e]))
  }
  */

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
        if(LOG) {
          console.log("title match", entry_value.title)
        }
        include_results.push(entry)
        continue
      }
    }

    // console.log("local search: title search done")

    if (search_config.include.tags && entry_value.tags) {
      let match = false
      //console.log("tags", entry_value.tags)
      Object.values(entry_value.tags).forEach((tags) => {
        for (let tag of tags) {
          if (compare_value(tag.name, search_config.include.tags)) {
            if(LOG) {
              console.log("tag match", entry_value.title)
            }
            include_results.push([entry_value.uuid, entry_value])
            match = true
            break
          }
          // todo do we need this?
          if (match) {
            continue
          }
        }
      })
    }

    // console.log("local search: tags search done")

    if (search_config.include.aspect_search) {
      const etype = store.getters["templates/entry_type"](entry_value.type_slug)
      if (etype.rules.hasOwnProperty("search_in")) {
        const search_in = etype.rules.search_in
        for (let aspect_loc_str of search_in) {
          try {
            const aspect_loc = loc_prepend(ENTRY, entry_value.uuid, aspect_loc_str2arr(aspect_loc_str))
            const value = store.getters["entries/value"](aspect_loc)
            // console.log(entry_value.title, aspect_loc_str, value)
            //console.log("received value", value)
            // TODO doesnt catch null!
            if (value.value && compare_value(value.value, search_config.include.aspect_search)) {
              const aspect_name = aspect_loc[1][1]
              if(LOG) {
                console.log("aspect match", entry_value.title)
              }
              include_results.push([entry_value.uuid, entry_value, aspect_name])
            }
          } catch (e) {
            console.log("aspect search failed for entry", entry_value.title, "search_in:", aspect_loc_str)
          }
        }
      }
    }
    // console.log("local search: aspect search done")
  }
  console.log("search.results", include_results)
  return include_results
}

