import {DRAFT, EDIT, PRIVATE_LOCAL, VIEW} from "~/lib/consts";
import {resolve_tags, select_aspect_loc} from "~/lib/entry";

import {guarantee_array, recursive_unpack} from "~/lib/util";


const ld = require("lodash")

export const state = () => ({
  entries: new Map(),
  edit: null
})

// commit
export const mutations = {
  save_entry(state, entry) {
    state.entries.set(entry.uuid, entry)
  },
  delete_entry(state, uuid) {
    state.entries.delete(uuid)
  },
  delete_entries(state, uuids) {
    // turn entries to array, filter by passed uuids; turn back into 2 val array, and rebuild Map
    state.entries = new Map(Array.from(state.entries.values()).filter(e => !uuids.includes(e.uuid)).map(e => [e.uuid, e]))
  },
  add_ref_child(state, {uuid, child_uuid, aspect_loc}) {
    state.entries.get(uuid).refs.children[child_uuid] = aspect_loc
  },
  clear(state, {keep_drafts = true, keep_uuid}) {
    let kept_entry = null
    if (keep_uuid) {
      kept_entry = state.entries.get(keep_uuid)
    }
    if (keep_drafts) {
      const drafts = ld.filter(Array.from(state.entries.values()), e => e.status === DRAFT)
      state.entries = new Map(ld.map(drafts, e => [e.uuid, e]))
    } else {
      state.entries.clear()
    }
    if (kept_entry) {
      state.entries.set(kept_entry.uuid, kept_entry)
    }
    state.edit = null
  },
  new_set_edit_entry_value(state, {aspect_name, value}) {
    state.edit.values[aspect_name] = value
  },
  new_set_entry_value(state, {uuid, aspect_loc, value}) {
    let entry = undefined
    if (uuid === null) {
      entry = state.edit
    } else {
      entry = state.entries.get(uuid)
    }
    if ([null, undefined].includes(entry)) {
      logger.error("Cannot retrieve entry for new value setter")
      return
    }
    const values = entry.values
    // good to have it as jsonpath but thats not needed here
    if (aspect_loc.substring(0, 2) === "$.") {
      aspect_loc = aspect_loc.substring(2)
    }
    ld.set(values, aspect_loc, value)
  },

  set_from_array(state, uuid_entry_array) {
    state.entries = new Map(uuid_entry_array)
  },
  set_edit(state, entry_data) {
    state.edit = entry_data
  },  // todo template for all kinds of computed meta-aspects
  set_edit_meta_value(state, {meta_aspect_name, value}) {
    state.edit[meta_aspect_name] = value
  },
  update_location(state, {uuid, location}) {
    // todo, this shouldnt be here. the licci reviews are wrongly converted sometimes. into {lon:{}, lat:{}}
    location = ld.filter(location, loc => (loc && typeof loc.coordinates.lat === "number"))
    if (uuid) {
      state.entries.get(uuid).location = location
    } else {
      state.edit.location = location
    }
  },
  update_tags(state, {uuid, tags}) {
    // console.log(tags)
    if (!uuid) {
      state.edit.tags = tags
    } else {
      // console.log("update tags", tags)
      state.entries.get(uuid).tags = tags
    }
  },
  insert_missing_default_values(state, {uuid, type_default_values}) {
    let values = state.entries.get(uuid).values
    for (let key in type_default_values) {
      if (!values.hasOwnProperty(key)) {
        values[key] = type_default_values[key]
      }
    }
  },
  set_entry_status(state, {uuid, status}) {
    const e = state.entries.get(uuid)
    if (e) {
      e.status = status
    } else {
      console.log("cannot set status, entry missing", uuid)
    }
  },
  add_file_attachment(state, attachment) {
    const {entry_uuid, ...attachment_data} = attachment
    let entry = null
    if (entry_uuid) {
      entry = state.entries.get(entry_uuid)
    } else
      entry = state.edit
    entry.attached_files.push(attachment_data)
  },
  remove_file_attachment(state, {entry_uuid, file_uuid}) {
    let entry = null
    if (ld.get(state.edit, "uuid") === entry_uuid) {
      entry = state.edit
    } else {
      entry = state.entries.get(entry_uuid)
    }
    if (entry) {
      entry.attached_files = entry.attached_files.filter(a => a.file_uuid !== file_uuid)
    }
  },
  set_edit_local(state, data) {
    state.edit.local = Object.assign(state.edit.local, ld.cloneDeep(data))
  }
}

// getters
export const getters = {
  all_entries_uuid_entry_arr(state) {
    return () => {
      return Array.from(state.entries.entries())
    }
  },
  all_entries_array(state) {
    //console.log(state.entries)
    return () => {
      return Array.from(state.entries.values())
    }
  },
  all_uuids(state, getters) {
    return () => getters.all_entries_array().map(e => e.uuid)
  },
  get_edit(state) {
    return () => {
      return state.edit
    }
  },
  edit_uuid(state) {
    if (state.edit)
      return state.edit.uuid
    else return ""
  },
  get_status(state) {
    return (uuid) => {
      return state.entries.get(uuid).status
    }
  },
  get_propper__mode(state, getters) {
    return (uuid) => {
      const e = getters.get_entry(uuid)
      if (e.privacy === PRIVATE_LOCAL) {
        return EDIT
      } else {
        const user_rights = getters.user_rights(undefined, e.uuid)
        const status = getters.get_status(e.uuid)

      }
    }
  },
  all_drafts(state) {
    return () => {
      let result = []
      // fuckn mapIterator
      // todo this should work tho...
      // return ld.filter(Array.from(state.entries.values()), e => e.status === DRAFT)
      for (let e of state.entries.values()) {
        if (e.status === DRAFT)
          result.push(e)
      }
      return result
    }
  },
  has_entry(state) {
    return (uuid) => {
      return state.entries.has(uuid)
    };
  },
  has_full_entry(state, getters) {
    return (uuid) => {
      return state.entries.has(uuid) && getters.get_entry(uuid).values !== undefined
    };
  },
  get_entry(state) {
    return (uuid) => {
      return state.entries.get(uuid)
    }
  },
  get_entries(state, getters) { // ENTRIES_GET_ENTRIES
    return (uuids) => {
      return ld.filter(getters.all_entries_array(), e => ld.includes(uuids, e.uuid))
    }
  },
  get_own_entries_uuids(state, getters) {
    let result = []
    for (let e of state.entries.values()) {
      if (getters.user_rights(e.uuid) === EDIT)
        result.push(e.uuid)
    }
    return result
  },
  user_rights(state, getters, rootGetters) { // ENTRIES_USER_RIGHTS
    return (uuid) => {
      const entry = getters.get_entry(uuid)
      if (ld.find([entry.actors.creator] + entry.actors.owners, actor => actor.registered_name === rootGetters.name)) {
        return EDIT
      } else {
        return VIEW
      }
    }
  },
  get_recursive_entries(state, getters) {
    return (uuid) => {
      let entries = []
      const entry = getters.get_entry(uuid)
      //console.log(entry)
      if (entry) {
        entries.push(entry)
        const child_keys = Object.keys(entry.entry_refs.children)
        const child_entries_list = ld.map(child_keys, uuid => getters.get_recursive_entries(uuid))
        child_entries_list.forEach(ce_list => {
          ce_list.forEach(c_entry => {
            entries.push(c_entry)
          })
        })
      }
      return entries
    }
  },
  // todo, maybe not here...
  get_entry_type(state, getters, root_state, rootGetter) {
    return slug => {
      const entry_type = rootGetter["templates/entry_type"](slug)
      if (!entry_type) {
        console.log("No entry type for slug", slug)
        return null
      } else {
        return entry_type
      }
    }
  },
  get_search_entries: function (state) {
    return (state.entries)
  },
  // domain(state, getters, rootState, rootGetters) {
  //   return (uuid) => {
  //     const entry = getters.get_entry(uuid)
  //     const etype = getters.get_entry_type(entry.template.slug)
  //     return rootGetters.domain_of_type(etype.slug).title
  //   }
  // },
  domain_drafts(state, getters) {
    return (domain) => {
      return Array.from(state.entries.values()).filter(e => e.status === "draft" && e.domain === domain)
    }
  },
  entry_tags(state, getters) {
    return (uuid) => {
      // console.log("entry_tags")
      const entry = uuid ? getters.get_entry(uuid) : getters.get_edit()
      const entry_type = getters.get_entry_type(entry.template.slug)
      const tagsAspect = entry_type.rules.tagsAspect
      const all_tags = {}
      for (let tags_type in tagsAspect) {
        const aspect_tag_location = tagsAspect[tags_type]
        let tags = select_aspect_loc(state, aspect_tag_location)
        tags = recursive_unpack(tags)
        tags = guarantee_array(tags)
        tags = ld.flattenDeep(tags)
        tags = tags.filter(t => !ld.isEmpty(t))
        tags = Array.from(new Set(tags))
        if (tags.length > 0) {
          all_tags[tags_type] = tags
        }
      }
      return all_tags
    }
  }
}

// dispatch
export const actions = {
  save_entries({state, getters}, entries) {
    for (let entry of entries) {
      if (!getters.has_full_entry(entry.uuid)) {
        state.entries.set(entry.uuid, entry)
      }
    }
  },
  save_child_n_ref(context, {uuid, child, aspect_loc}) {
    if (!uuid) {
      uuid = context.getters.edit_uuid
    }
    let child_uuid = child.uuid
    context.dispatch("save_entry", uuid)
    context.commit("save_entry", child)
    context.commit("add_ref_child", {uuid, aspect_loc, child_uuid})
  },
  cancel_entry_edit({commit}, uuid) {
    commit("cancel_entry_edit", uuid)
  },
  save_entry(context, {entry, template}) {
    context.commit("update_tags", {tags: resolve_tags(entry, template)})
    // const location = context.getters.entry_location()
    // console.log("update_entry. location",location)
    // if (location) {
    //   // console.log(recursive_unpack(location))
    //   const simple_location = filter_empty(recursive_unpack(location))
    //   context.commit("update_location", {location: simple_location})
    // }
    context.commit("save_entry", context.getters.get_edit())
  },
  // update_entry(context, uuid) {
  //const entry_title = context.getters.get_entry_title(uuid)
  // context.commit("update_title", {uuid, title: entry_title})
  // const location = context.getters.entry_location(uuid)
  // // console.log("update_entry. location",location)
  // if (location) {
  //   // console.log(recursive_unpack(location))
  //   const simple_location = filter_empty(recursive_unpack(location))
  //   context.commit("update_location", {uuid, location: simple_location})
  // }
  // },
  set_edit(context, uuid) {
    if (!context.state.edit || context.state.edit.uuid !== uuid) {
      const entry = context.getters.get_entry(uuid)
      context.commit("set_edit", ld.cloneDeep(entry))
    }
  },
  delete_entry(context, uuid) {
    // console.log(uuid)
    const entry = context.state.entries.get(uuid)
    if (entry) {
      context.commit("delete_entry", uuid)
      context.commit("set_edit", null)
    } else {
      console.log("store: entries DELETE tries to delete some entry that doesnt exist!")
    }
  }
}
