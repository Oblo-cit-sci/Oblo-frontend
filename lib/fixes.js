import {ENTRIES_ALL_ENTRIES_ARRAY, ENTRIES_SAVE_ENTRY} from "./store_consts";

export function fix_add_licci_domain(store) {
  console.log("fix_add_licci_domain")
  const entries = store.getters[ENTRIES_ALL_ENTRIES_ARRAY]()
  let count = 0
  for(let e of entries) {
    if(!e.domain) {
      e.domain = "licci"
      count+= 1
      store.commit(ENTRIES_SAVE_ENTRY, e)
    }
  }
  console.log(count,"entries fixed")
}
