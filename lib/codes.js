
import {tree_cut_at_level, tree_options_add_ids} from "~/lib/options"

const ld = require("lodash")

export function get_uuids_select_option(){
  return {
    name: "uuids_select"
  }
}

export function create_cluster_select_search_config(place_name, uuids) {
  /**
   * that is the name, but its actually a uuid_select config. which ignores all other configs, ... and even calls another
   * api method
   * @type {null|undefined}
   */

  return {
    name: "select_uuids",
    t_label: "w.location",
    text: place_name,
    value: uuids,
    edit: {
      editable: false,
      removable: true
    }
  }
}

export function build_tag_select_tree(tree_entry) {
  const tag_levels = ld.get(tree_entry, "rules.tags.from_tree.levels", [])
  if (ld.isEmpty(tag_levels)) {
    console.log("No tag levels for", tree_entry)
  }
  // todo, because of this the rules from_tree.levels must be an array of names...
  const last_level_name = tag_levels.slice(-1)[0]
  const last_level_index = ld.findIndex(tree_entry.values.levels, l => l.value === last_level_name) + 1
  tree_options_add_ids(tree_entry.values)
  // todo could be skipped if its the last level already
  return tree_cut_at_level(tree_entry.values, last_level_index)
}

export function build_tag_select_list(list_entry) {
  return list_entry.values.list
}

export function find_templates_using_code(store, code_slug, language) {
  return store.getters["templates/entry_types_array"](language).filter(
    // todo 2nd condition, ref.ref_type === 'tag'
    template => ld.some(template.entry_refs, ref => ref.dest_slug === code_slug && ref.ref_type === "tag"))
}

export function get_code_of_template(store, template_slug, language) {
  return ld.get(store.getters["templates/entry_type"](template_slug, language), "entry_refs").filter(c_ref => c_ref.ref_type === "tag").map(c_ref => c_ref.dest_slug)
}
