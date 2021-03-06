const ld = require("lodash");

export function string2option(s) {
  return {text: s, value: s}
}

export function create_option(value, text) {
  return {value, text}
}

// todo check where its needed and evtl move
export function string_list2options(values) {
  return ld.map(values, s => {
    return string2option(s)
  })
}

function complete_option(option) {
  if (!option.text) {
    return Object.assign({text: option.value}, option)
  } else {
    return option
  }
}

export function transform_options_list(values) {
  return ld.map(values, s => (typeof s === "string" ?
    string2option(s)
    : complete_option(s)))
}


function _object_to_option(c, text_from, value_from, clean = false, include_additional = [], include_extra = {}) {
  // console.log("_object_to_option", c)
  let result = Object.assign(clean ? include_extra : ld.cloneDeep(c), {
    text: c["text"] || c[text_from],
    value: c["value"] || c[value_from],
    ...include_extra
  })
  // console.log(c, result, include_additional)
  if (include_additional.length > 0) {
    for (let attr of include_additional) {
      if (typeof attr === "string") {
        if (c.hasOwnProperty(attr)) {
          result[attr] = c[attr]
        }
      } else { // object, key => position
        for (let key in attr) {
          result[key] = ld.get(c, attr[key])
        }
      }
    }
  }
  return result
}

// todo if this would be with locators, it would also work for composites
export function object_list2options(values, text_from, value_from, clean = false, include_additional = []) {
  // console.log("object_list2options", values)
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

/**
 * @deprecated
 * @param store
 * @param code_slug
 * @returns {{}|*}
 */
export function get_codes_as_tree(store, code_slug) {
  // todo : this getter should be replaced... and actually requires a language
  let code_entry = store.getters["templates/code"](code_slug)
  if (!code_entry) {
    console.log(`code entry ${code_slug} not found`)
    return {}
  }
  if (code_entry.template.slug === "value_tree") {
    const tree_ = ld.cloneDeep(code_entry.values)
    tree_options_add_ids(tree_)
    return tree_
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
  // not just the string but also all nodes above (except the root)
  const store_path = options.store_path || true

  let result = []

  let lf = function (level, i = 0, parents = []) {
    // console.log("Parents", parents)
    if (include_levels) {
      if (include_levels.indexOf(i) !== -1) {
        //console.log("+",level.name)
        const option = _object_to_option(level, "name", "name", true, ["description"], {parents: parents})
        result.push(option)
      }
    } else {
      if (!level.hasOwnProperty("children")) {
        const option = _object_to_option(level, "name", "name", true, ["description"], {parents: parents})
        result.push(option)
      }
    }
    for (let item of level.children || []) {
      // ignore root
      const {value, text} = level
      const parent = {value, text}
      if (level.icon)
        parent.icon = level.icon
      const new_parents = i > 0 ? ld.concat(parents, parent) : []
      lf(item, i + 1, new_parents)
    }
  }
  lf(tree.root)
  return result
}

export function tree_cut_at_level(tree, cut_level) {
  const check_node = (node, level) => {
    if (level === cut_level) {
      node.children = []
    } else {
      for (let kid of node.children) {
        check_node(kid, level + 1)
      }
    }
  }
  const new_tree = Object.assign({}, tree)
  check_node(new_tree.root, 0)
  return new_tree
}

/**
 * @vuese
 * @param tree
 */
export function tree_options_add_ids(tree) {
  let next_id = 1

  const rec_add_id = (node) => {
    node.id = next_id
    next_id++
    for (let child of node.children || []) {
      rec_add_id(child)
    }
  }
  rec_add_id(tree.root)
}

/**
 * @vuese
 * naaa
 */
// export default {
//   name: "options",
//   methods: {
//
//     string2option(s) {
//       return {text: s, value: s}
//     },
//
//     create_option(value, text) {
//       return {value, text}
//     },
//
// // todo check where its needed and evtl move
//     string_list2options(values) {
//       return ld.map(values, s => {
//         return string2option(s)
//       })
//     },
//
//     complete_option(option) {
//       if (!option.text) {
//         return Object.assign({text: option.value}, option)
//       } else {
//         return option
//       }
//     },
//
//     transform_options_list(values) {
//       return ld.map(values, s => (typeof s === "string" ?
//         string2option(s)
//         : complete_option(s)))
//     },
//
//
//     _object_to_option(c, text_from, value_from, clean = false, include_additional = [], include_extra = {}) {
//       // console.log("_object_to_option", c)
//       let result = Object.assign(clean ? include_extra : ld.cloneDeep(c), {
//         text: c["text"] || c[text_from],
//         value: c["value"] || c[value_from],
//         ...include_extra
//       })
//       // console.log(c, result, include_additional)
//       if (include_additional.length > 0) {
//         for (let attr of include_additional) {
//           if (typeof attr === "string") {
//             if (c.hasOwnProperty(attr)) {
//               result[attr] = c[attr]
//             }
//           } else { // object, key => position
//             for (let key in attr) {
//               result[key] = ld.get(c, attr[key])
//             }
//           }
//         }
//       }
//       return result
//     },
//
// // todo if this would be with locators, it would also work for composites
//     object_list2options(values, text_from, value_from, clean = false, include_additional = []) {
//       // console.log("object_list2options", values)
//       return ld.map(values, (c) => _object_to_option(c, text_from, value_from, clean, include_additional))
//     },
//
//     no_duplicate_texts(options, text_key = "text") {
//       let strings = ld.map(options, o => o[text_key])
//       strings = no_duplicate_string(strings)
//       for (let i = 0; i < strings.length; i++) {
//         options[i][text_key] = strings[i]
//       }
//     },
//
//     no_duplicate_string(strings) {
//       let count = {}
//       let re_added = {}
//       let results = []
//
//       const counter = (obj, s) => {
//         if (obj.hasOwnProperty(s)) {
//           obj[s] += 1
//         } else {
//           obj[s] = 1
//         }
//       }
//
//       strings.forEach(s => counter(count, s))
//       for (let i = 0; i < strings.length; i++) {
//         let s = strings[i]
//         if (count[s] > 1) {
//           counter(re_added, s)
//           s += " (" + re_added[s] + ")"
//         }
//         results.push(s)
//       }
//
//       return results
//     },
//
//     composite_list2options(composite_values) {
//       return ld.map(composite_values, (c) => {
//         return {text: c.value[0].value, value: c.value[1].value}
//       })
//     },
//
//     /**
//      * @deprecated
//      * @param store
//      * @param code_slug
//      * @returns {{}|*}
//      */
//     get_codes_as_tree(store, code_slug) {
//       let code_entry = store.getters["templates/code"](code_slug)
//       if (!code_entry) {
//         console.log(`code entry ${code_slug} not found`)
//         return {}
//       }
//       if (code_entry.template.slug === "value_tree") {
//         const tree_ = ld.cloneDeep(code_entry.values)
//         tree_options_add_ids(tree_)
//         return tree_
//       } else {
//         console.log("problems withn code", code_slug)
//         return {}
//       }
//     },
//
//     /**
//      * @vuese
//      * @param tree, options
//      */
//     flatten_tree_to_options(tree, options = {}) {
//       // configurable for now:
//       // options can have include_levels: an array of ints
//       // it will then take these levels (level 0 included)
//       // otherwise it will only take the leaves
//       const include_levels = options.include_levels || null
//       // not just the string but also all nodes above (except the root)
//       const store_path = options.store_path || true
//
//       let result = []
//
//       let lf = function (level, i = 0, parents = []) {
//         // console.log("Parents", parents)
//         if (include_levels) {
//           if (include_levels.indexOf(i) !== -1) {
//             //console.log("+",level.name)
//             const option = _object_to_option(level, "name", "name", true, ["description"], {parents: parents})
//             result.push(option)
//           }
//         } else {
//           if (!level.hasOwnProperty("children")) {
//             const option = _object_to_option(level, "name", "name", true, ["description"], {parents: parents})
//             result.push(option)
//           }
//         }
//         for (let item of level.children || []) {
//           // ignore root
//           const {value, text} = level
//           const parent = {value, text}
//           if (level.icon)
//             parent.icon = level.icon
//           const new_parents = i > 0 ? ld.concat(parents, parent) : []
//           lf(item, i + 1, new_parents)
//         }
//       }
//       lf(tree.root)
//       return result
//     },
//
//     /**
//      * @vuese
//      * this is the description...
//      *
//      * @arg `tree`: pass the tree;
//      * @arg `cut_level` at which level to cut
//      */
//     tree_cut_at_level(tree, cut_level) {
//       const check_node = (node, level) => {
//         if (level === cut_level) {
//           node.children = []
//         } else {
//           for (let kid of node.children) {
//             check_node(kid, level + 1)
//           }
//         }
//       }
//       const new_tree = Object.assign({}, tree)
//       check_node(new_tree.root, 0)
//       return new_tree
//     },
//
//     /**
//      * @vuese
//      * @param tree
//      */
//     tree_options_add_ids(tree) {
//       let next_id = 1
//
//       const rec_add_id = (node) => {
//         node.id = next_id
//         next_id++
//         for (let child of node.children || []) {
//           rec_add_id(child)
//         }
//       }
//       rec_add_id(tree.root)
//     }
//
//   }
// }
