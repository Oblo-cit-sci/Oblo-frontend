export const state = () => ({
  next_id: 0,
  drafts: {}
});

export const mutations = {
  create_draft(state, draft_data){
    state.drafts[state.next_id] = draft_data;
    state.next_id++;
  },
  save_draft(state, draft_data) {
    state.drafts[draft_data.entry_id] = draft_data;
  },
  remove_draft(state, entry_id) {
    delete state.drafts[entry_id]
  },
  set_draft_aspect_value(entry_id, aspect_index, value) { // for pageAspects and references entries to update the parent

  }
};

const ld = require('lodash');

export const getters = {
  // cuz they are stored as array but we access by name
  // todo Map solves this nicer
  // HOW DO WE ACCESS THESE???
};

