import {COMPOSITE, LIST} from "../lib/consts";
import {object_list2options} from "../lib/options";
import {entries_domain_filter} from "../lib/search";
import {ASPECT, ENTRYLIST} from "~/lib/consts";

const ld = require("lodash")

export const state = () => ({
  entry_types: new Map(), // types for creation
  notes: {}
})

export const getters = {
  has_type(state) {//ENTRYTYPES_HAS_TYPE
    return (type_slug) => {
      return state.entry_types.has(type_slug)
    }
  },
  entry_type(state) { // ENTRYTYPES_TYPE
    return (type_slug) => {
      // console.log("getting entry_type for slug", type_slug)
      if (!state.entry_types.has(type_slug)) {
        console.log("WARNING, store,entrytype.getters.entry_type: type for slug missing", type_slug, "returning null, should be catched earlier")
      }
      return state.entry_types.get(type_slug)
    }
  },
  type_name(state, getters) { // ENTRYTYPES_TYPENAME
    return slug => {
      // console.log("typename of ", slug)
      const etype = getters.entry_type(slug)
      if (etype) {
        return etype.title
      } else {
        console.log("WARNING: type for unknown slug requested", slug)
        return "unknown type:" + slug
      }
    }
  },
  domain_of_type(state) {
    return slug => {
      return ld.filter(state.domains, domain => domain.value === state.entry_types.get(slug).domain)[0]
    }
  },
  // entry-types
  global_entry_types_as_array(state) {
    // todo generalize, e.g. array of 2val array ["context", "global"]
    let global_entry_types = [];
    for (let entry of state.entry_types.values()) {
      if (entry.rules.context === "global") {
        global_entry_types.push(entry)
      }
    }
    return global_entry_types
  },
  entrytypes(state) { // ENTRYTYPES_TYPES
    return Object.fromEntries(state.entry_types)
  },
  entrytypes_of_domain(state) { // ENTRYTYPES_OF_DOMAIN
    return domain => {
      return entries_domain_filter(Array.from(state.entry_types.values()), domain)
    }
  },
  get_aspect_def(state, getters) { // ENTRYTYPES_GET_ASPECT_DEF
    return ({type_slug, aspect_name}) => {
      let type = getters.entry_type(type_slug)
      return type.aspects.find(a => {
        return a.name === aspect_name
      })
    }
  },
  get_aspect_index(state) {
    return (type_slug, aspect_name) => {
      return ld.findIndex(state.entry_types.get(type_slug).aspects, (a) => a.name === aspect_name)
    }
  },
  get_aspect(state) {
    return (type_slug, aspect_name) => {
      return ld.find(state.entry_types.get(type_slug).aspects, (a) => a.name === aspect_name)
    }
  },
  entrytype_options(state, getters) {
    return object_list2options(getters.entry_types_array, "title", "slug")
  },
  entry_types_array(state) {
    return Array.from(state.entry_types.values())
  },
  all_notes(state) {
    return state.notes
  },
  type_notes(state) { // ENTRYTPES_TYPE_NOTES
    return (type_slug) => {
      return state.notes[type_slug]
    }
  },
  note(state, getters) {
    return aspect_descr_loc => {
      let type_notes = getters.type_notes(aspect_descr_loc[0])
      aspect_descr_loc = ld.drop(aspect_descr_loc)
      let select = type_notes
      //console.log(type_notes)

      if (!type_notes) {
        //console.log("no notes for this type")
        return null
      }

      const c_s = (loc) => {
        if (!select) {
          console.log("note error access:", select, loc, aspect_descr_loc)
        }
        return select
      }

      for (let loc of aspect_descr_loc) {
        if (!c_s()) {
          return select
        }
        select = select[loc]
      }
      if (!c_s()) {
        return select
      } else {
        return select._note
      }
    }
  },
  get_entrylist_aspect_locs(state, getters) {
    return (type_slug) => {
      const locations = []
      const e_type = getters.entry_type(type_slug)
      for (let aspect of e_type.aspects) {
        if(aspect.type === ENTRYLIST) {
          // console.log([ASPECT, aspect.name])
          locations.push([[ASPECT, aspect.name]])
        }
      }
      return locations
    }
  }
}

export const mutations = {
  entrytype(state, newtype) {
    state.entry_types[newtype.type_slug] = newtype;
    //state.entry_type_slug_index_dict[newtype.slug] = state.available_entries.length - 1;
  },
  add_templates(state, template_arr) {
    for(let template of template_arr) {
      state.entry_types.set(template.slug, template);
    }
  },
  set_notes(state, notes) {
    state.notes = notes
  },
  set_type_notes(state, {type_slug, notes}) {
    state.notes[type_slug] = notes
    // todo this is a shame. no re-assign no update!
    // state.notes = new Map(Array.from(state.notes))
  },
  init_notes(state, type_slug) {
    state.notes[type_slug] = {}
  },
  add_aspect_descr_notes(state, {type_slug, aspect_name, notes}) {
    state.notes[type_slug][aspect_name] = notes
  },
  add_note(state, {note_location, note}) { // ENTRYTYPES_ADD_NOTE
    // console.log("adding note", note_location, "<", note, ">")
    const type_slug = note_location[0]
    const type_notes = state.notes[type_slug]
    if (type_notes) {
      let select = type_notes
      note_location = ld.drop(note_location)
      for (let loc of note_location) {
        select = select[loc]
      }
      select = Object.assign(select, {_note: note})
      select = ld.cloneDeep(select)
      // TODO fucking annoying, and triggers update on all aspects!
      state.notes = ld.cloneDeep(state.notes)
    } else {
      console.log("entrytypes: add_note: wtf!")
    }
  },
  init_aspect_note(state, aspect_loc) {
    let select = state.notes
    for (let loc of aspect_loc) {
      if (select.hasOwnProperty(loc)) {
        select = select[loc]
      } else {
        select[loc] = {_note: null}
      }
    }
  },
  set_types(state, types) {
    for(let type_slug in types) {
      state.entry_types.set(type_slug, types[type_slug])
    }
  }
}

export const actions = {
  init_notes(context, type_slug) {
    let entry_type = context.getters.entry_type(type_slug)

    const rec_aspect_descr_note_init = (aspect) => {
      let note_wrapper = {
        _note: null
      }
      if (aspect.type === LIST) {
        note_wrapper[aspect.items.name] = rec_aspect_descr_note_init(aspect.items)
      } else if (aspect.type === COMPOSITE) {
        aspect.components.forEach(c => note_wrapper[c.name] = rec_aspect_descr_note_init(c))
      }
      return note_wrapper
    }

    context.commit("init_notes", type_slug)
    for (let aspect of entry_type.aspects) {
      //console.log(aspect.name)
      context.commit("add_aspect_descr_notes", {
        type_slug,
        aspect_name: aspect.name,
        notes: rec_aspect_descr_note_init(aspect)
      })
    }
  },
  update_entry_types(context, entrytypes) {

  }
}
