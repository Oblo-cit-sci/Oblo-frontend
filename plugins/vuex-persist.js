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
        meta: state.meta,
      }
    ),
  }).plugin(store)


  //this crap is recommended, but just throws errors.
  /*
  const waitForStorageToBeReady = async (to, from, next) => {
    console.log(store.state.restored)
    await store.restored
    console.log(store.state.restored)
    next()
  }
  store.app.router.beforeEach(waitForStorageToBeReady)
   */

}


