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
    state.drafts[draft_data.draft_id] = draft_data;
  },
  remove_draft(state, draft_id) {
    delete state.drafts[draft_id]
  },
  set_draft_aspect_value(draft_id, aspect_index, value) { // for pageAspects and references entries to update the parent

  }
};

