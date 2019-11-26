import {COMPOSITE, LIST} from "../lib/consts";

const ld = require("lodash")

export const state = () => ({
  notes: {}
})

export const mutations = {
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
    console.log("adding note",note_location,  "<", note, ">")
    const type_slug = note_location[0]
    const type_notes = state.notes[type_slug]
    if (type_notes) {
      let select = type_notes
      note_location = ld.drop(note_location)
      for (let loc of note_location) {
        select = select[loc]
      }
      select._note = note
      //select = ld.cloneDeep(select)
      state.notes[type_slug] = ld.cloneDeep(type_notes)
    } else {
      console.log("entrytypes: add_note: wtf!")
    }

  }
}

export const getters = {
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

      if(!type_notes) {
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

export const actions = {
  init_notes(context, type_slug) {
    let entry_type = context.rootGetters.entry_type(type_slug)

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
