import {GET_CODE} from "~/lib/store_consts";

const ld = require("lodash");


export function string2option(s) {
  return {text: s, value: s}
}

// todo check where its needed and evtl move
export function string_list2options(values) {
  return ld.map(values, s => {
    return string2option(s)
  })
}

function _object_to_option(c, text_from, value_from, clean = false, include_additional = []) {
  let result = Object.assign(clean ? {} : ld.cloneDeep(c), {
    text: c["text"] || c[text_from],
    value: c["value"] || c[value_from]
  })
  if (include_additional.length > 0) {
    for (let attr of include_additional) {
      if (c.hasOwnProperty(attr)) {
        result[attr] = c[attr]
      }
    }
  }
  return result
}

// todo if this would be with locators, it would also work for composites
export function object_list2options(values, text_from, value_from, clean = false, include_additional = []) {
  return ld.map(values, (c) => _object_to_option(c, text_from, value_from, clean, include_additional))
}

export function no_duplicate_texts(options, text_key = "text") {
  let strings = ld.map(options, o => o[text_key])
  strings = no_duplicate_string(strings)
  for (let i = 0; i < strings.length; i++) {
    options[i][text_key] = strings[i]
  }
}

export function no_duplicate_string(strings) {
  let count = {}
  let re_added = {}
  let results = []

  const counter = (obj, s) => {
    if (obj.hasOwnProperty(s)) {
      obj[s] += 1
    } else {
      obj[s] = 1
    }
  }

  strings.forEach(s => counter(count, s))
  for (let i = 0; i < strings.length; i++) {
    let s = strings[i]
    if (count[s] > 1) {
      counter(re_added, s)
      s += " (" + re_added[s] + ")"
    }
    results.push(s)
  }

  return results
}

export function composite_list2options(composite_values) {
  return ld.map(composite_values, (c) => {
    return {text: c.value[0].value, value: c.value[1].value}
  })
}

export function get_codes_as_options(store, code_slug) {
  code_slug = code_slug.substring(1)
  let code_entry = store.getters["get_code"](code_slug)
  const values = code_entry.values
  // todo, here fetch if missing, but rather then this, make sure that for all used templates, all codes are downloaded
  // TODO this will be default later
  if (code_entry.template.slug === "value_list") {
    return string_list2options(values.list)
  } else {
    console.log("problems withn code", code_slug)
    return []
  }
  // return string_list2options(code_entry)
}

export function get_codes_as_tree(store, code_slug) {
  code_slug = code_slug.substring(1)
  let code_entry = store.getters[GET_CODE](code_slug)
  if(!code_entry) {
    console.log(`code entry ${code_slug} not found`)
    return {}
  }
  const values = code_entry.values
  if (code_entry.template.slug === "value_tree") {
    return values.tree
  } else {
    console.log("problems withn code", code_slug)
    return {}
  }
}

export function flatten_tree_to_options(tree, options = {}) {
  // configurable for now:
  // options can have include_levels: an array of ints
  // it will then take these levels (level 0 included)
  // otherwise it will only take the leaves
  const include_levels = options.include_levels || null
  //const remain_position = options.remain_position || false

  let result = []

  let lf = function (level, i = 0) {

    if (include_levels) {
      if (include_levels.indexOf(i) !== -1) {
        //console.log("+",level.name)
        const option = _object_to_option(level, "name", "name", true, ["description"])
        result.push(option)
        //result.push(level.name) // maybe also value
        /*if (level.name.includes("*")) {
          console.log(option)
        }*/
      }
    } else {
      if (!level.hasOwnProperty("children")) {
        const option = _object_to_option(level, "name", "name", true, ["description"])
        result.push(option)
        /*if (level.name.includes("*")) {
          console.log(option)
        }*/
        //result.push(level.name) // maybe also value
      }
    }
    for (let item of level.children || []) {
      lf(item, i + 1)
    }
  }
  lf(tree, -1)
  return result
}
