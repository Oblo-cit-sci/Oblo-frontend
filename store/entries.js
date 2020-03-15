/*
  this is for the own entries
 */
import {ASPECT, COMPONENT, DRAFT, EDIT, ENTRY, INDEX, PRIVATE_LOCAL, VIEW} from "../lib/consts";
import {default_values, get_entry_titleAspect, select_aspect_loc} from "../lib/entry";
import {
  aspect_loc_str,
  aspect_loc_str2arr,
  aspect_loc_uuid,
  last_loc_value,
  loc_prepend,
  loc_remove_last,
  remove_entry_loc
} from "../lib/aspect";
import {ENTRYTYPES_TYPE, GET_ENTRY} from "../lib/store_consts";

import Vue from "vue"
import {filter_empty, flatten_collection_of_lists, recursive_unpack} from "../lib/util";
import {META} from "~/lib/consts";


// Mutations
export const ENTRIES_ADD_TIMELINE_ENTRIES = "entries/add_timeline_entries"
export const ENTRIES_SET_DOWNLOADED = "entries/set_downloaded"
export const ENTRIES_ENTRIES_SET_LOCAL_LIST_PAGE = "entries/entries_set_local_list_page"
export const ENTRIES_SET_ENTRY_STATUS = "entries/set_entry_status"
export const SET_DIRTY = "set_dirty"
export const ENTRIES_CLEAR = "entries/clear"
export const ENTRIES_UPDATE_TAGS = "entries/update_tags"
export const ENTRIES_UPDATE_IMAGE = "entries/update_image"
export const ENTRIES_ADD_FILE_ATTACHMENT = "entries/add_file_attachment"
export const ENTRIES_REMOVE_FILE_ATTACHMENT = "entries/remove_file_attachment"
export const ENTRIES_SET_FROM_ARRAY = "entries/set_from_array"
// internal
export const _SET_ENTRY_VALUE = "_set_entry_value"
export const UPDATE_TAGS = "update_tags"
// Getter
export const ENTRIES_HAS_ENTRY = "entries/has_entry"
export const ENTRIES_GET_ENTRY = "entries/get_entry"
export const ENTRIES_GET_ENTRIES = "entries/get_entries"
// Actions
export const ENTRIES_SAVE_ENTRY = "entries/save_entry"
export const ENTRIES_UPDATE_ENTRY = "entries/update_entry"
export const ENTRIES_SET_EDIT = "entries/set_edit"
export const ENTRIES_CREATE_CHILD = "entries_create_child"
export const ENTRIES_SAVE_CHILD_N_REF = "entries/save_child_n_ref"
export const ENTRIES_ALL_ENTRIES_UUID_ENTRY_ARR = "entries/all_entries_uuid_entry_arr"
export const ENTRIES_ALL_ENTRIES_ARRAY = "entries/all_entries_array"
export const ENTRIES_GET_ENTRY_TITLE = "entries/get_entry_title"
export const ENTRIES_GET_PARENT = "entries/get_parent"
export const ENTRIES_ENTRY_TITLE = "entries/get_entry_title"
export const ENTRIES_DOMAIN = "entries/domain"
export const ENTRIES_ALL_ENTRIES_OF_TYPE = "entries/all_entries_of_type"
export const ENTRIES_USER_RIGHTS = "entries/user_rights"
export const ENTRIES_VALUE = "entries/value"
export const ENTRIES_DRAFTS = "entries/all_drafts"
export const ENTRIES_GET_EDIT = "entries/get_edit"
export const EDIT_UUID = "entries/edit_uuid"
//
export const ENTRIES_SET_ENTRY_VALUE = "entries/set_entry_value"
export const ENTRIES_DELETE_ENTRY = "entries/delete_entry"
export const ENTRIES_EDIT_DELETE_REF_CHILD = "entries/delete_edit_ref_child"
export const ENTRIES_GET_RECURSIVE_ENTRIES = "entries/get_recursive_entries"
export const ENTRIES_GET_CHILDREN = "entries/get_children"
export const ENTRIES_SET_EDIT_CLEAN = "entries/set_edit_clean"

const ld = require("lodash")

const DELETE_ENTRY = "delete_entry"
const DELETE_REF_CHILD = "delete_ref_child"

export const state = () => ({
  timeline_entries: [],
  entries: new Map(),
  edit: null
});

// commmit
export const mutations = {
  add_timeline_entries(state, entries) {
    state.timeline_entries = entries;
  },
  save_entry(state, entry) {
    state.entries.set(entry.uuid, entry)
  },
  delete_edit_entry(state) {
    state.edit = null
  },
  set_downladed(state, uuid) {
    let entry = state.entries.get(uuid)
    entry.downloads = entry.version
  },
  delete_entry(state, uuid) { // DELETE_ENTRY
    state.entries.delete(uuid)
  },
  set_downloaded(state, local_id) {
    let e = state.entries.get(local_id)
    //console.log("DL ", e, local_id)
    e.downloaded_version = e.version
  },
  add_edit_ref_child(state, {aspect_loc, child_uuid}) {
    state.edit.refs.children[child_uuid] = aspect_loc
  },
  add_ref_child(state, {uuid, child_uuid, aspect_loc}) {
    state.entries.get(uuid).refs.children[child_uuid] = aspect_loc
  },
  delete_edit_ref_child(state, child_uuid) {
    delete state.edit.refs.children[child_uuid]
  },
  // todo, shouldnt be needed
  set_ref_parent(state, {uuid, ref}) {
    state.entries.get(uuid).refs.parent = ref
  },
  clear(state) {
    state.entries.clear()
    state.edit = null
    state.timeline_entries = []
  },
  _set_entry_value(state, {aspect_loc, value}) { // ENTRIES_SET_ENTRY_VALUE
    // console.log("set entry value", aspect_loc, value)
    let select = select_aspect_loc(state, aspect_loc, true)
    const final_loc = ld.last(aspect_loc)
    //console.log("final,", final_loc, "select", select, "value", value)

    if (final_loc[0] === ASPECT) {
      select[final_loc[1]] = value
    } else if (final_loc[0] === COMPONENT) {
      select.value[final_loc[1]] = value
    } else if (final_loc[0] === META) {
      //TODO (fix later) we need this cuz just entries, already goes to values
      // debugger
      select = state.entries.get(aspect_loc[0][1])
      select[final_loc[1]] = value
    } else if (final_loc[0] === INDEX) {
      Vue.set(select.value, final_loc[1], value)
    } else {
      console.log("ERROR store.entries. final location", final_loc)
    }
  },
  _remove_entry_value_index(state, aspect_loc) {
    let select = select_aspect_loc(state, aspect_loc, true)
    const final_loc = ld.last(aspect_loc)
    select.value = ld.filter(select.value, (_, index) => index !== final_loc[1])
  },
  _remove_entry_ref_index(state, {uuid, child_uuid, aspect_loc}) {
    let children = state.entries.get(uuid).refs.children
    delete state.entries.get(uuid).refs.children[child_uuid]
    const pre_aspect_loc = loc_remove_last(aspect_loc)
    const shift_index = last_loc_value(aspect_loc)
    for (let other_child_uuid in children) {
      const other_aspect_loc = children[other_child_uuid]
      if (ld.isEqual(loc_remove_last(other_aspect_loc), pre_aspect_loc)) {
        if (other_aspect_loc[other_aspect_loc.length - 1][1] > shift_index) {
          other_aspect_loc[other_aspect_loc.length - 1][1]--
        }
      }
    }
  },
  set_dirty(state, uuid = state.edit.uuid) {
    let entry = state.entries.get(uuid)
    if (!entry.local) {
      entry.local = {}
    }
    entry.local.dirty = true
  },
  set_incomplete(state, {uuid, incomplete}) {
    state.entries.get(uuid).local.incomplete = incomplete
  },
  set_edit_clean(state) { // ENTRIES_SET_EDIT_CLEAN
    if (state.edit) {
      state.edit.local.dirty = false
    }
  },
  // todo renmae, update entry
  _update_entry(state, uuid) {
    let entry = state.entries.get(uuid)
    entry.version += 1
    entry.local.prev = null
  },
  // todo renmae, update entry
  _save_entry(state, uuid) {
    let entry = state.entries.get(uuid)
    entry.version += 1
    entry.local.prev = null
  },
  set_from_array(state, uuid_entry_array) {
    state.entries = new Map(uuid_entry_array)
  },
  set_edit(state, uuid) {
    state.edit = state.entries.get(uuid)
  },  // todo template for all kinds of computed meta-aspects
  update_title(state, {uuid, title}) {
    state.entries.get(uuid).title = title
  },
  update_location(state, {uuid, location}) {
    // todo, this shouldnt be here. the licci reviews are wrongly converted sometimes. into {lon:{}, lat:{}}
    location = ld.filter(location, loc => (loc && typeof loc.coordinates.lat === "number"))
    state.entries.get(uuid).location = location
  },
  update_tags(state, {uuid, tags}) {
    console.log("update tags", tags)
    state.entries.get(uuid).tags = tags
  },
  update_image(state, {uuid, image_url}) {
    state.entries.get(uuid).image = image_url
  },
  entries_set_local_list_page(state, {aspect_loc, page}) {
    let entry = state.entries.get(aspect_loc_uuid(aspect_loc))
    // todo, later out, should be there from the creation
    if (!entry.local.list_pages) {
      entry.local.list_pages = {}
    }
    const loc_str = aspect_loc_str(remove_entry_loc(aspect_loc))
    entry.local.list_pages[loc_str] = page
    //let entry =
    //remove_entry_loc
  },
  _update_parent_version(state, {uuid = state.edit.uuid, version}) {
    state.entries.get(uuid).parent_type_version = version
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
  // fixer
  fix_refs(state, {parent_uuid, child_uuid, aspect_loc}) {
    state.entries.get(parent_uuid).refs.children[child_uuid] = aspect_loc
    state.entries.get(child_uuid).refs.parent.aspect_loc = aspect_loc
  },
  add_file_attachment(state, attachment) {
    const {entry_uuid, ...attachment_data} = attachment
    const entry = state.entries.get(entry_uuid)
    entry.attached_files.push(attachment_data)
  },
  remove_file_attachment(state, {entry_uuid, file_uuid}) {
    const entry = state.entries.get(entry_uuid)
    entry.attached_files = entry.attached_files.filter(a => a.file_uuid !== file_uuid)
  }
}

// getters
export const getters = {
  all_entries_uuid_entry_arr(state) {
    return () => {
      return Array.from(state.entries.entries())
    }
  },
  all_entries_array(state) { // ENTRIES_ALL_ENTRIES_ARRAY
    //console.log(state.entries)
    return () => {
      return Array.from(state.entries.values())
    }
  },
  get_edit(state) {
    return state.edit
  },
  edit_uuid(state) {
    if (state.edit)
      return state.edit.uuid
    else return ""
  },
  get_status(state) {
    return (uuid = state.edit) => {
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
        // if (user_rights === EDIT && status === DRAFT) {
        //   return EDIT
        // } else {
        //   return VIEW
        // }
      }
    }
  },
  all_drafts(state) {
    // as method prevents caching
    return () => {
      // todo fuck, how to run a filter over Map class
      let result = []
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
  get_entry(state) { // ENTRIES_GET_ENTRY
    return (uuid) => {
      return state.entries.get(uuid)
    }
  },
  get_entries(state, getters) { // ENTRIES_GET_ENTRIES
    return (uuids) => {
      return ld.filter(getters.all_entries_array(), e => ld.includes(uuids, e.uuid))
    }
  },
  get_children(state) {
    return (entry) => {
      return ld.map(entry.refs.children, ref => state.entries.get(ref.uuid))
    }
  },
  get_own_entries(state) {
    // todo
  },
  user_rights(state, getters, rootState, rootGetters) { // ENTRIES_USER_RIGHTS
    return (uuid = state.edit.uuid) => {
      const entry = getters[GET_ENTRY](uuid)
      if (ld.find(entry.actors.owners, owner => owner.uid === user_uid)) {
        return EDIT
      } else {
        return VIEW
      }
    }
  },
  get_parent(state, getters) { // ENTRIES_GET_PARENT
    return (uuid = state.edit.uuid) => {
      //console.log("getter", entry, entry.refs)
      return getters.get_entry(getters.get_entry(uuid).refs.parent.uuid)
    }
  },
  value(state, getters) { // ENTRIES_VALUE
    return (aspect_loc) => {
      const first_atype = aspect_loc[0][0]
      if (![ENTRY, EDIT].includes(first_atype)) {
        aspect_loc = ld.concat([[EDIT, getters.edit_uuid]], aspect_loc)
      }
      return select_aspect_loc(state, aspect_loc)
    }
  },
  get_recursive_entries(state, getters) { //  ENTRIES_GET_RECURSIVE_ENTRIES
    return (uuid = state.edit.uuid) => {
      let entries = []
      const entry = getters.get_entry(uuid)
      //console.log(entry)
      if (entry) {
        entries.push(entry)
        const child_keys = Object.keys(entry.refs.children)
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
  get_entry_type(state, getters, root_state, rootGetter) {
    return slug => {
      const entry_type = rootGetter[ENTRYTYPES_TYPE](slug)
      if (!entry_type) {
        console.log("No entry type for slug", slug)
        return null
      } else {
        return entry_type
      }
    }
  },
  // todo: get edit title, but will be simpler...?
  get_entry_title: function (state, getters) {
    return (uuid = state.edit.uuid) => {
      console.log("get entry title ", uuid)
      const entry = getters.get_entry(uuid)
      const type = getters.get_entry_type(entry.template.slug)
      let titleAspect = get_entry_titleAspect(type)
      if (!titleAspect) {
        //console.log("entries.get_entry_title TODO, use default title for type")
        return entry.title
      }
      // todo maybe it would be cleaner to add "entry "+uuid , so that  aspect_loc_str2arr/is wrapped around
      const title = select_aspect_loc(state, loc_prepend(ENTRY, uuid, aspect_loc_str2arr(titleAspect)))
      //console.log("get_entry_title", title)
      if (title && title.value)
        return title.value
      else {
        //console.log("entries.get_entry_title TODO, use default title for type")
        return entry.title
      }
    }
  },
  entry_location: function (state, getters) {
    return (uuid = state.edit.uuid) => {
      const entry = getters.get_entry(uuid)
      const entry_type = getters.get_entry_type(entry.template.slug)
      const locationAspect = entry_type.rules.locationAspect
      let location = null
      if (locationAspect) {
        location = select_aspect_loc(state, loc_prepend(ENTRY, uuid, aspect_loc_str2arr(locationAspect)))
        // this is weird
        if (location && location.value)
          location = location.value
      }
      return location
    }
  },
  get_search_entries: function (state) {
    return (state.entries)
  },
  domain: function (state, getters, rootState, rootGetters) {
    return (uuid = state.edit.uuid) => {
      const entry = getters.get_entry(uuid)
      const etype = getters.get_entry_type(entry.template.slug)
      return rootGetters.domain_of_type(etype.slug).title
    }
  },
  domain_drafts_uuids(state, getters) {
    return (domain) => {
      return Array.from(state.entries.values()).filter(e => e.status === "draft" && e.domain === domain).map(e => e.uuid)
    }
  },
  entry_tags(state, getters) {
    return (uuid = state.edit.uuid) => {
      const entry = getters.get_entry(uuid)
      const entry_type = getters.get_entry_type(entry.template.slug)
      const tagsAspect = entry_type.rules.tagsAspect
      const all_tags = {}
      for (let tags_type in tagsAspect) {
        const aspect_tag_location = tagsAspect[tags_type]
        let tags = select_aspect_loc(state, loc_prepend(ENTRY, uuid, aspect_loc_str2arr(aspect_tag_location)))
        tags = flatten_collection_of_lists(tags)
        tags = ld.uniqBy(tags, t => t.value)
        tags = ld.filter(tags, t => t.value) // kickout empty string
        tags = ld.map(tags, t => t.value) // tag format // todo icons...
        if (tags.length > 0) {
          all_tags[tags_type] = tags
        }
      }
      return all_tags
    }
  },
  all_entries_of_type(state, getters) {
    return type_slug => getters.all_entries_array().filter(e => e.template.slug === type_slug)
  },
  get_orphans(state, getters) {
    ld.filter(getters.all_entries_array(), e => e.state === "orphan")
  }
}

// dispatch
export const actions = {
  set_entry_value(context, data) {
    context.commit(_SET_ENTRY_VALUE, data)
    context.commit(SET_DIRTY, aspect_loc_uuid(data.aspect_loc))
    // context.commit("update")
  },
  save_child_n_ref(context, {uuid, child, aspect_loc}) { // ENTRIES_SAVE_CHILD_N_REF
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
  // rename to save edit entry
  // todo: purpose/name: update meta or something like that?
  //
  update_entry(context, uuid = context.state.edit.uuid) { // ENTRIES_UPDATE_ENTRY
    const entry_title = context.getters.get_entry_title(uuid)
    context.commit("update_title", {uuid, title: entry_title})
    const location = context.getters.entry_location(uuid)
    if (location) {
      // console.log("save_entry. loc",location )
      const simple_location = filter_empty(recursive_unpack(location))
      context.commit("update_location", {uuid, location: simple_location})
    }
    const tags = context.getters.entry_tags(uuid)
    if (tags) {
      context.commit(UPDATE_TAGS, {uuid, tags: tags})
    }
  },
  // TODO LIKE THIS DEPRACATED. should take an entry, commit save it and set update, potential parents and children
  save_entry(context, uuid = context.state.edit.uuid) {
    const entry_title = context.getters.get_entry_title(uuid)
    context.commit("update_title", {uuid, title: entry_title})
    const location = context.getters.entry_location(uuid)
    if (location) {
      console.log("save_entry. loc", location)
      const simple_location = filter_empty(recursive_unpack(location))
      context.commit("update_location", {uuid, location: simple_location})
    }
    const tags = context.getters.entry_tags(uuid)
    if (tags) {
      context.commit(UPDATE_TAGS, {uuid, tags: tags})
    }
  },
  set_edit(context, uuid) {
    context.commit("set_edit", uuid)
  },
  delete_ref_child(context, {uuid, child_uuid}) { // DELETE_REF_CHILD
    let aspect_loc = context.state.entries.get(uuid).refs.children[child_uuid]
    context.commit("_remove_entry_value_index", ld.concat([[ENTRY, uuid]], aspect_loc))
    context.commit("_remove_entry_ref_index", {uuid, child_uuid, aspect_loc})
  },
  delete_entry(context, uuid) { // ENTRIES_DELETE_ENTRY
    // console.log(uuid)
    const entry = context.state.entries.get(uuid)
    if (entry) {
      for (let child_uuid in entry.refs.children) {
        context.dispatch(DELETE_ENTRY, child_uuid)
      }
      if (entry.status !== "orphan" && entry.refs.parent) {
        const parent = entry.refs.parent
        context.dispatch(DELETE_REF_CHILD, {uuid: parent.uuid, child_uuid: uuid})
      }
      context.commit(DELETE_ENTRY, uuid)
    } else {
      console.log("store: entries DELETE tries to delete some entry that doesnt exist!")
    }
  },
  update_parent_version(context, uuid = context.state.edit.uuid) {
    const template = context.getters.get_entry_type(context.getters.get_entry(uuid).template.slug)
    const type_default_values = default_values(template)
    context.commit("insert_missing_default_values", {uuid, type_default_values})
    context.commit("_update_parent_version", {uuid, version: template.version})
  }
}
