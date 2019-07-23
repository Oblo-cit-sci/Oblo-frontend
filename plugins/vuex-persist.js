import VuexPersistence from 'vuex-persist'

import localforage from 'localforage'
/*
export default ({ store }) => {
  window.onNuxtReady(() => {
    new VuexPersistence({
      /!* your options *!/
      storage: localforage,
      strictMode: true
    }).plugin(store);
  });
}*/

export default ({ store }) => {
  new VuexPersistence({
    storage: localforage,
  }).plugin(store)
}
