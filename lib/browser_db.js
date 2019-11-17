function store_value(localForage, key, value) {
  localForage.setItem(key,  value).then(() => {
    //console.log("stored")
  }).catch(err => {
    console.log("browser db error")
    console.log(err)
  })
}

export function store_entries(localForage, store) {
  store_value(localForage, "entries", store.state.entries.entries)
}

export function store_user_key(localForage, store) {
  store_value(localForage, "user_key", store.getters.user_key)
}

export function store_draft_numbers(localForage, store) {
  store_value(localForage, "draft_numbers", store.getters.draft_numbers)
}
