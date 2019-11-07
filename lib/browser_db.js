export function store_entries(localfoage, store) {
  localfoage.setItem("entries", store.state.entries.entries).then(() => {
    //console.log("stored")
  }).catch(err => {
    console.log("browser db error")
    console.log(err)
  })
}
