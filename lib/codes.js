import {ALL_CODES} from "~/store"
import {entries_domain_filter} from "~/lib/search"
import {tree_cut_at_level, tree_options_add_ids} from "~/lib/options"
import {MULTISELECT, TREEMULTISELECT} from "~/lib/consts"
import {TEMPLATES_TYPES_ARRAY} from "~/store/templates"

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
    const used_in_templates = find_templates_using_code(store, code.slug).map(template => template.title)
    if (code.template.slug === "value_tree") {
      const tag_tree = build_tag_select_tree(ld.cloneDeep(code))
      options_aspects.push(
        {
          name: code.title,
          description: "Used in: " + used_in_templates.join(", "),
          type: TREEMULTISELECT,
          attr: {},
          items: tag_tree
        }
      )
    } else if (code.template.slug === "value_list") {
      const tag_list = build_tag_select_list(ld.cloneDeep(code))
      options_aspects.push(
        {
          name: code.title,
          description: "Used in: " + used_in_templates.join(", "),
          type: MULTISELECT,
          attr: {},
          items: tag_list
        }
      )
    } else {
      console.log(`unknown code template for ${code.title}, template slug: ${code.template.slug}`)
    }
  }

  return {
    name: "tags",
    label: "Tags",
    options: filter_codes.map(c => c.title),
    aspect: {
      name: "tags_select",
      label: "Tags",
      description: "Start with source-entry for tags. Then select multiple tags that you would like to include in your search. Any entry that includes at least one of the selected tags will be included in the result.",
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
  tree_options_add_ids(tree_entry.values)
  // todo could be skipped if its the last level already
  return tree_cut_at_level(tree_entry.values, last_level_index)
}

function build_tag_select_list(list_entry) {
  return list_entry.values.list
}

function find_templates_using_code(store, code_slug) {
  return store.getters[TEMPLATES_TYPES_ARRAY].filter(
    template => (ld.get(template.entry_refs, code_slug, null) === "code"))
}
