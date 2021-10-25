import {ASPECT, COMPONENT, DRAFT, EDIT, ENTRY, INDEX, META, PRIVATE_LOCAL, VIEW} from "~/lib/consts";
import {get_entry_titleAspect, resolve_tags, select_aspect_loc} from "~/lib/entry";
import {
  aspect_loc_str,
  aspect_loc_str2arr,
  aspect_loc_uuid,
  last_loc_value,
  loc_prepend,
  loc_remove_last,
  remove_entry_loc
} from "~/lib/aspect";


import Vue from "vue"
import {filter_empty, guarantee_array, recursive_unpack} from "~/lib/util";


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
  _set_entry_value(state, {aspect_loc, value}) {
    // console.log("set entry value", aspect_loc, value)
    let select = select_aspect_loc(state, aspect_loc, true)
    // ld.set()
    // console.log("_set_entry_value", aspect_loc)
    const final_loc = ld.last(aspect_loc)
    //console.log("final,", final_loc, "select", select, "value", value)
    if (final_loc[0] === ASPECT) {
      $nuxt.$set(select, [final_loc[1]], value)
    } else if (final_loc[0] === COMPONENT) {
      select.value[final_loc[1]] = value
    } else if (final_loc[0] === META) {
      //TODO (fix later) we need this cuz just entries, already goes to values
      // debugger
      if (aspect_loc[0][0] === EDIT) {
        select = state.edit
      } else {
        select = state.entries.get(aspect_loc[0][1])
      }
      select[final_loc[1]] = value
    } else if (final_loc[0] === INDEX) {
      Vue.set(select.value, final_loc[1], value)
    } else {
      console.log("ERROR store.entries. final location", final_loc)
    }
  },
  new_set_entry_value(state, {uuid, aspect_loc, value}) {
    let entry = undefined
    if (uuid === null) {
      entry = state.edit
    } else {
      entry = state.entries.get(uuid)
    }
    if([null, undefined].includes(entry)) {
      logger.error("Cannot retrieve entry for new value setter")
      return
    }
    const values = entry.values
    // good to have it as jsonpath but thats not needed here
    if(aspect_loc.substring(0,2) === "$.") {
      aspect_loc = aspect_loc.substring(2)
    }
    ld.set(values, aspect_loc, value)
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
  set_from_array(state, uuid_entry_array) {
    state.entries = new Map(uuid_entry_array)
  },
  set_edit(state, entry_data) {
    state.edit = entry_data
  },  // todo template for all kinds of computed meta-aspects
  update_title(state, {uuid, title}) {
    if (!uuid) {
      state.edit.title = title
    } else {
      state.entries.get(uuid).title = title
    }
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
  update_image(state, image_url) {
    state.edit.image = image_url
  },
  entries_set_local_list_page(state, {aspect_loc, page}) {
    let entry = state.entries.get(aspect_loc_uuid(aspect_loc))
    // todo, later out, should be there from the creation
    if (!ld.get(entry, "local.list_pages")) {
      if (!entry.hasOwnProperty("local")) {
        entry.local = {}
      }
      entry.local.list_pages = {}
    }
    const loc_str = aspect_loc_str(remove_entry_loc(aspect_loc))
    entry.local.list_pages[loc_str] = page
    //let entry =
    //remove_entry_loc
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
  get_size(state) {
    return state.entries.size
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
  get_children(state) {
    return (entry) => {
      return ld.map(entry.entry_refs.children, ref => state.entries.get(ref.uuid))
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
  get_parent(state, getters) {
    return (uuid) => {
      return getters.get_entry(getters.get_entry(uuid).refs.parent.uuid)
    }
  },
  value(state, getters) {
    return (aspect_loc) => {
      const first_atype = aspect_loc[0][0]
      if (![ENTRY, EDIT].includes(first_atype)) {
        aspect_loc = ld.concat([[EDIT, getters.edit_uuid]], aspect_loc)
      }
      return select_aspect_loc(state, aspect_loc)
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
  // todo: get edit title, but will be simpler...?
  get_entry_title: function (state, getters) {
    return (uuid) => {
      // console.log("get entry title ", uuid)
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
  // todo this is more of an meta-aspect generator function
  entry_location: function (state, getters) {
    return (uuid) => {
      const entry = uuid ? getters.get_entry(uuid) : getters.get_edit()
      const entry_type = getters.get_entry_type(entry.template.slug)
      const locationAspect = entry_type.rules.locationAspect
      if (!locationAspect) {
        return null
      }
      let location = null
      if (locationAspect) {
        if (uuid) {
          location = select_aspect_loc(state, loc_prepend(ENTRY, uuid, aspect_loc_str2arr(locationAspect)))
        } else {
          location = select_aspect_loc(state, loc_prepend(EDIT, entry.uuid, aspect_loc_str2arr(locationAspect)))
        }
        // this is weird
        if (location && location.value)
          location = location.value
      }
      if (!Array.isArray(location)) {
        location = [location]
      }
      return location
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
        let tags = select_aspect_loc(state, loc_prepend(ENTRY, uuid, aspect_loc_str2arr(aspect_tag_location)))
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
  save_entries({state, getters}, entries) {
    for (let entry of entries) {
      if (!getters.has_full_entry(entry.uuid)) {
        state.entries.set(entry.uuid, entry)
      }
    }
  },
  set_entry_value(context, data) {
    context.commit("_set_entry_value", data)
    // context.commit("update")
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
    // todo duplicate of the one below:
    const location = context.getters.entry_location()
    // console.log("update_entry. location",location)
    if (location) {
      // console.log(recursive_unpack(location))
      const simple_location = filter_empty(recursive_unpack(location))
      context.commit("update_location", {location: simple_location})
    }
    context.commit("save_entry", context.getters.get_edit())
  },
  update_entry(context, uuid) {
    //const entry_title = context.getters.get_entry_title(uuid)
    // context.commit("update_title", {uuid, title: entry_title})
    const location = context.getters.entry_location(uuid)
    // console.log("update_entry. location",location)
    if (location) {
      // console.log(recursive_unpack(location))
      const simple_location = filter_empty(recursive_unpack(location))
      context.commit("update_location", {uuid, location: simple_location})
    }
  },
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
