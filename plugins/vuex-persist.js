import VuexPersistence from 'vuex-persist'

import localforage from 'localforage'

export default ({ store }) => {
  new VuexPersistence({
    storage: localforage,
  }).plugin(store)
}
