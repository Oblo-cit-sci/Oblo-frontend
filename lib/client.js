import {db_vars} from "~/lib/db_vars";
import {
  SEARCH_APPEND_ENTRIES,
  SEARCH_INCREASE_COUNT,
  SEARCH_PREPEND_ENTRIES,
  SEARCH_SET_ENTRIES,
  SEARCH_SET_SEARCH_COUNT,
  SEARCH_SET_SEARCHING,
  SEARCH_SET_SEARCHTIME
} from "~/store/search";
import {ENTRIES_GET_ENTRY, ENTRIES_HAS_FULL_ENTRY, ENTRIES_SAVE_ENTRY, ENTRIES_SIZE} from "~/store/entries";
import {CONNECTING, DB_LOADED, INITIALIZED, SET_DOMAINS, SET_TEMPLATES_CODES} from "~/store";
import {USER_GET_AUTH_TOKEN, USER_LOGGED_IN, USER_LOGIN, USER_RESET_AUTH_TOKEN} from "~/store/user";

const LOG = true

const pkg = require('../package')

const ld = require("lodash")


export const debounced_search = ld.debounce(search_entries, 1000)

export function process_cachable_entries(store, cachable_entries) {
  const entry_uuids = []
  for (let entry of cachable_entries) {
    if (typeof entry === "object") {
      store.commit(ENTRIES_SAVE_ENTRY, entry)
      entry_uuids.push(entry.uuid)
    } else {
      entry_uuids.push(entry)
    }
  }
  return entry_uuids
}

export function search_entries(api, store, config, offset = 0) {
  const prepend = config.required.some(r => r.name === "before_ts")
  api.entries_search(
    ld.get(config, "page.limit", 60),
    ld.get(config, "page.offset", offset),
    config)
    .then(({data}) => {
      const count = data.data.count
      const cachable_entries = data.data.entries
      if (!store) {
        return resolve(cachable_entries)
      }
      const entry_uuids = process_cachable_entries(store, cachable_entries)
      if (offset === 0) {
        if (prepend) {
          store.commit(SEARCH_PREPEND_ENTRIES, entry_uuids)
          store.commit(SEARCH_INCREASE_COUNT, count)
        } else {
          store.commit(SEARCH_SET_ENTRIES, entry_uuids)
          store.commit(SEARCH_SET_SEARCH_COUNT, count)
        }
        const ts = data.data.ts
        store.commit(SEARCH_SET_SEARCHTIME, ts)
      } else {
        store.commit(SEARCH_APPEND_ENTRIES, entry_uuids)
      }
      store.commit(SEARCH_SET_SEARCHING, false)
    }).catch(err => {
    console.log("search_entries err", err)
    store.commit(SEARCH_SET_SEARCHING, false)
  })
}

export async function async_entry_search(api, config) {
  return api.entries_search(
    ld.get(config, "page.limit", 60),
    ld.get(config, "page.offset", 0),
    config)
}

export async function initialize(api, store, route, router) {
  store.commit(CONNECTING, true)
  console.log("initialize")

  const {data} = await api.init_data()
  const domains_basic_data = data.data.domains
  store.commit(SET_DOMAINS, domains_basic_data)
  store.dispatch(SET_TEMPLATES_CODES, data.data.templates_and_codes)

  // todo login also,
  const auth_token = store.getters[USER_GET_AUTH_TOKEN]
  if (auth_token.access_token) {
    const login = await api.actor__validate_token(auth_token)
    if (login.data.token_valid) {
      store.commit(USER_LOGIN)
      api.axios.setToken("Bearer " + auth_token.access_token)
      check_clear_cache(store, api)
    } else {
      store.commit(USER_RESET_AUTH_TOKEN)
      this.error_snackbar("You are logged out")
    }
  }

  // todo maybe this part should be handled by the individual page, so it can do its default behaviour
  // but a wrapper would be good.
  if (route.query.uuid && !store.getters[ENTRIES_HAS_FULL_ENTRY](route.query.uuid)) {
    console.log("need to get that entry")
    try {
      const response = await api.entry__$uuid(route.query.uuid)
      if (response.status === 200) {
        store.commit(ENTRIES_SAVE_ENTRY, response.data.data)
      } else {
        router.push("/")
      }
    } catch (e) {
      console.log(e)
      router.push("/")
    }
  }
  console.log(store.getters[ENTRIES_GET_ENTRY](route.query.uuid))

  store.commit(CONNECTING, false)
  store.commit(INITIALIZED)

  // todo check if needed, regular entries?
  // if (route.name === "domain-domain") {
  //   // console.log("grabbing domain templates...")
  //
  //   const config = {
  //     required: [
  //       {
  //         name: "meta",
  //         column: DOMAIN,
  //         conditional_value: route.params.domain
  //       }
  //     ]
  //   }
  //
  //   const ts = new Date()
  //   api.entries_search(20, 0, config).then(({data}) => {
  //
  //     const count = data.data.count
  //     const cachable_entries = data.data.entries
  //     const entry_uuids = []
  //     for (let entry of cachable_entries) {
  //       if (typeof entry === "object") {
  //         store.commit(ENTRIES_SAVE_ENTRY, entry)
  //         entry_uuids.push(entry.uuid)
  //       } else {
  //         entry_uuids.push(entry)
  //       }
  //     }
  //     store.commit(SEARCH_SET_ENTRIES, entry_uuids)
  //     store.commit(SEARCH_SET_SEARCH_COUNT, count)
  //     store.commit(SEARCH_SET_SEARCHTIME, ts)
  //     store.commit(SET_DOMAIN, this.domain)
  //     console.log("domain entries received!")
  //   }).catch(err => {
  //     console.log("problems fetching domains")
  //     console.log(err)
  //   })
  // }

}

export function reload_storage(store, localForage) {
  if (localForage) {
    console.log("RELOAD STORAGE")
    const remaining = db_vars.map(v => v.name)
    for (let store_var_descr of db_vars) {
      // console.log("loading", store_var_descr.name)
      localForage.getItem(store_var_descr.name).then(store_var => {
        // console.log("db items: ", store_var_descr.name, store_var)
        if (store_var) {
          // console.log(store_var.constructor)
          store.commit(store_var_descr.store_mutation, store_var)
        }
        remaining.splice(remaining.indexOf(store_var_descr.name), 1);
        if (remaining.length === 0) {
          store.commit(DB_LOADED)
        }
      }).catch(err => {
        console.log("localForage error", err)
      })
    }
  }
}

export function check_clear_cache(store, api) {
  console.log("check_clear_cache", store.getters[ENTRIES_SIZE], store.getters[USER_LOGGED_IN])
  if (store.getters[ENTRIES_SIZE] === 0 && store.getters[USER_LOGGED_IN]) {
    api.actor_clear_cache().then(() => {
      console.log("cache cleared")
    }).catch(err => {
      console.log(err)
      console.log("api error: actor_clear_cache")
    })
  }
}


export function server_static_file_path(axios, static_file_path) {
  return axios.defaults.baseURL + "/static/" + static_file_path
}

// todo no.
export function server_icon_path(axios, icon_sub_path) {
  return server_static_file_path(axios, "images/icons/" + icon_sub_path)
}


export function app_version() {
  return pkg.version
}



