// const ld = require("lodash")

import {ALL_CODES} from "~/store"
import {entries_domain_filter} from "~/lib/search"
import {tree_cut_at_level} from "~/lib/options"
import {TREEMULTISELECT} from "~/lib/consts"

const ld = require("lodash")

export function get_tags_filter_options(store, domain) {
  const all_codes = store.getters[ALL_CODES]
  let filter_codes = Object.values(all_codes).filter(code_entry => code_entry.rules.tags || null)
  if (domain) {
    filter_codes = entries_domain_filter(filter_codes, domain)
  }
  // filter_codes = object_list2options(filter_codes, "title", "slug")
  const options_aspects = []
  for (let code of filter_codes) {
    // console.log(code)
    if (code.template.slug === "value_tree") {
      const code_clone = ld.cloneDeep(code)
      const tag_tree = build_tag_select_tree(code_clone)
      console.log(tag_tree)
      options_aspects.push(
        {
          name: code.title,
          type: TREEMULTISELECT,
          attr: {
          },
          items: tag_tree
        }
      )
    }
  }

  return {
    name: "tags",
    label: "Tags",
    options: filter_codes.map(c => c.title),
    aspect: {
      name: "tags_select",
      type: "options",
      attr: {},
      options: options_aspects
    },
    search_config: {
      include_as: "tags"
    }
  }
}

function build_tag_select_tree(tree_entry) {

  const tag_levels = ld.get(tree_entry, "rules.tags.from_tree.levels", [])
  if (ld.isEmpty(tag_levels)) {
    console.log("No tag levels for", tree_entry)
  }
  const last_level_name = tag_levels.slice(-1)[0]
  const last_level_index = tree_entry.values.levels.indexOf(last_level_name) + 1
  // todo could be skipped if its the last level already
  return tree_cut_at_level(tree_entry.values, last_level_index)
}
