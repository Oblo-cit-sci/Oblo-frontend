export const state = () => ({
  next_id: 0,
  drafts: {}
});

export const mutations = {
  create_draft(state, draft_data) {
    state.drafts[state.next_id] = draft_data;
    state.next_id++;
    console.log(state)
  },
  save_draft(state, draft_data) {
    state.drafts[draft_data.draft_id] = draft_data;
  },
  remove_draft(state, draft_id) {
    delete state.drafts[draft_id]
  },
  // data MUST have draft_id, aspect_name, value, OPTIONAL: index, ( and key)
  set_draft_aspect_value(state, data) { // for pageAspects and references entries to update the parent
    if (data.hasOwnProperty("index")) { // TODO or key
      state.drafts[data.draft_id].aspects_values[data.aspect_name][data.index] = data.value;
    } else {
      state.drafts[data.draft_id].aspects_values[data.aspect_name] = data.value;
    }
  },
  add_reference(state, reference_info) {
    state.drafts[reference_info.draft_id].ref = reference_info.ref
  }
};

const ld = require('lodash');

/// TODO FUCK WONT WORK !?!?
/*
export const getters = {
  // cuz they are stored as array but we access by name
  // HOW DO WE ACCESS THESE???

  drafts_by_slug(state, getters) {
    return (type_slug) => {
      return ld.filter(state.drafts, (d) => {
        return d.type_slug === type_slug
      })
    }
  },
  all_drafts(state) {
    return state.drafts
  }
}
*/
