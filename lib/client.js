
const LOG = true

const ld = require("lodash")

export const debounced_search = ld.debounce(search_entries, 1000)

// use EntrySearchMixin
export function store_received_entries(store, entries) {
  store.commit("entries/save_entries", entries)
  return entries.map(e => e.uuid)
}

// todo offset should just go into the config. see search.request_more
export function search_entries(api, store, config, offset = 0) {
  const prepend = config.required.some(r => r.name === "before_ts")
  api.entries_search(
    ld.get(config, "page.limit", offset > 0 ? 20 : 40), // initially grab 40 (1page), then always 1 more
    ld.get(config, "page.offset", offset),
    config)
    .then(({data}) => {
      const count = data.data.count
      const entries = data.data.entries
      const all_uuids = data.data.all_uuids
      if (!store) {
        return resolve(entries)
      }
      const entry_uuids = store_received_entries(store, entries)
      if(all_uuids) {
        if(prepend) {
          store.commit("search/add_all_uuids", all_uuids)
        } else {
          store.commit("search/set_all_uuids", all_uuids)
        }
      }
      if (offset === 0) {
        if (prepend) {
          store.commit("search/prepend_entries", entry_uuids)
          store.commit("search/increase_search_count", count)
        } else {
          store.commit("search/set_entries", entry_uuids)
          store.commit("search/set_search_count", count)
        }
        const ts = data.data.ts
        store.commit("search/set_searchtime", ts)
      } else {
        store.commit("search/append_entries", entry_uuids)
      }
      store.commit("search/set_searching", false)
    }).catch(err => {
    console.log("search_entries err", err)
    store.commit("search/set_searching", false)
  })
}

// export async function async_entry_search(api, config, offset = 0, limit = 40) {
//   return api.entries_search(limit, offset, config)
// }


export function server_static_file_path(axios, static_file_path) {
  return axios.defaults.baseURL + "/static/" + static_file_path
}

// todo no.
export function server_icon_path(axios, icon_sub_path) {
  return server_static_file_path(axios, "images/icons/" + icon_sub_path)
}





