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

// todo if this would be with locators, it would also work for composites
export function object_list2options(values, text_from, value_from, clean = false) {
  return ld.map(values, (c) => {
    return Object.assign(clean ? {} : c, {text: c["text"] || c[text_from], value: c["value"] || c[value_from]})
  })
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

export function get_codes_as_options(state, code_name) {
  code_name = code_name.substring(1)
  const code_parts = code_name.split("/")
  let codes_raw = state.codes
  // todo, here fetch if missing, but rather then this, make sure that for all used templates, all codes are downloaded
  for (let part of code_parts) {
    codes_raw = codes_raw[part]
    if (!codes_raw) {
      console.log("part:", part, "is missing in", code_name)
      return []
    }
  }
  // todo
  // there could be a catch that the code does not exist, but that should be handled
  // also on the backend
  // but still, ....

  // TODO this will be default later
  if (codes_raw.hasOwnProperty("type_slug")) {
    if (codes_raw.type_slug === "valuemap") {
      return composite_list2options(codes_raw.aspects_values.values.value)
    }
  }
  return string_list2options(codes_raw)
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
        result.push(level.name) // maybe also value
      }
    } else {
      if (!level.hasOwnProperty("children")) {
        result.push(level.name) // maybe also value
      }
    }
    for (let item of level.children || []) {
      lf(item, i + 1)
    }
  }
  console.log("tree", tree, options)
  lf(tree, -1)
  return result
}
