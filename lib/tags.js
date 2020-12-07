const _ = require("lodash")

export function resolve_from_list_code(entry) {
  return _.map(entry.values.list, create_tag)
}

export function resolve_from_tree_code(entry) {
  const tags_rules = entry.rules.tags
  if (tags_rules.from_tree.levels) {
    const tree_schema = entry.values
    const all_level_names = _.map(tree_schema.levels, l => l.value)
    const levels = tags_rules.from_tree.levels
    const level_indexes = []
    for (let level of levels) {
      if (typeof level === "number")
        level_indexes.push(level)
      else {
        level_indexes.push(all_level_names.indexOf(level) + 1)
      }
    }
    return recursive_tag_gen(tree_schema, level_indexes)
  }
}

function recursive_tag_gen(tree, grab_levels) {
  const results = []
  const rec_grab_at_levels = (node, parent = null, act_level = 0) => {
    let act_level_tag = null
    if (grab_levels.includes(act_level)) {
      act_level_tag = create_tag(node)
      results.push(act_level_tag)
    }
    for (let child of node.children || []) {
      rec_grab_at_levels(child, act_level_tag, act_level + 1)
    }
  }
  rec_grab_at_levels(tree.root)
  return results
}


function create_tag({text, value, description}) {
  const res = {text, value}
  if (description) {
    res.description = description
  }
  return res
}
