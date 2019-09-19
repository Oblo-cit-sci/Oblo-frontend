import VuexPersistence from 'vuex-persist'

import localforage from 'localforage'

export default ({store}) => {
  new VuexPersistence({
    storage: localforage,
    reducer: (state) => (
      {
        entries: state.entries,
        codes: state.codes,
        draft_numbers: state.draft_numbers,
        entry_types: state.entry_types,
        user_data: state.user_data,
        meta: state.meta
      }
    ),
  }).plugin(store)
}
