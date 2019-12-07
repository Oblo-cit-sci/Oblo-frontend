import {COMPOSITE, LIST} from "../lib/consts";
import {object_list2options} from "../lib/options";
import {entries_domain_filter} from "../lib/search";

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
  entry_type(state) {
    return (type_slug) => {
      return state.entry_types.get(type_slug)
    }
  },
  type_name(state, getters) {
    return slug => {
      //console.log("typename of ", slug)
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
      if (entry.content.meta.context === "global") {
        global_entry_types.push(entry)
      }
    }
    return global_entry_types
  },

  entrytypes(state) {
    return Array.from(state.entry_types.values())
  },
  entrytypes_of_domain(state) {
    return domain => {
      return entries_domain_filter(Array.from(state.entry_types.values()), domain)
    }
  },
  get_aspect_def(state, getters) {
    return ({type_slug, aspect_name}) => {
      let type = getters.entry_type(type_slug)
      return type.content.aspects.find(a => {
        return a.name === aspect_name
      })
    }
  },
  get_aspect_index(state) {
    return (type_slug, aspect_name) => {
      return ld.findIndex(state.entry_types.get(type_slug).content.aspects, (a) => a.name === aspect_name)
    }
  },
  get_aspect(state) {
    return (type_slug, aspect_name) => {
      return ld.find(state.entry_types.get(type_slug).content.aspects, (a) => a.name === aspect_name)
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
  type_notes(state) {
    return (type_slug) => {
      return state.notes[type_slug]
    }
  },
  note(state, getters) {
    return aspect_descr_loc => {
      const type_notes = getters.type_notes(aspect_descr_loc[0])
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
          return null
        }
        select = select[loc]
      }
      if (!c_s()) {
        return null
      } else {
        return select._note
      }
    }
  }
}

export const mutations = {
  entrytype(state, newtype) {
    state.entry_types[newtype.type_slug] = newtype;
    //state.entry_type_slug_index_dict[newtype.slug] = state.available_entries.length - 1;
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
  add_note(state, {note_location, note}) {
    console.log("adding note", note_location, "<", note, ">")
    const type_slug = note_location[0]
    const type_notes = state.notes[type_slug]
    if (type_notes) {
      let select = type_notes
      note_location = ld.drop(note_location)
      for (let loc of note_location) {
        select = select[loc]
      }
      select._note = note
      select = ld.cloneDeep(select)
      //state.notes = ld.cloneDeep(state.notes)
    } else {
      console.log("entrytypes: add_note: wtf!")
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
    for (let aspect of entry_type.content.aspects) {
      //console.log(aspect.name)
      context.commit("add_aspect_descr_notes", {
        type_slug,
        aspect_name: aspect.name,
        notes: rec_aspect_descr_note_init(aspect)
      })
    }
  }
}
