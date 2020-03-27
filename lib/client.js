
import {NO_DOMAIN} from "./consts";
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
import {ENTRIES_SAVE_ENTRY, ENTRIES_SIZE} from "~/store/entries";
import {
  CONNECTING,
  CONNECTION,
  DB_LOADED,
  DOMAIN,
  SET_DOMAIN,
  SET_DOMAINS,
  SET_TEMPLATES_CODES_FOR_DOMAIN
} from "~/store";
import {USER_LOGGED_IN} from "~/store/user";

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
  const ts = new Date()

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

export async function initialize(api, store, route) {
  store.commit(CONNECTING, true)
  console.log("initialize", this)

  api.domain().then(({data}) => {
    console.log("connected to server")
    const domains = data.data
    store.commit(CONNECTION, true)
    store.commit(SET_DOMAINS, domains)
    store.commit(CONNECTING, false)
    //
    for (let domain of domains) {
      api.domain__$domain_name__basic_entries(domain.name).then(({data}) => {
        store.dispatch(SET_TEMPLATES_CODES_FOR_DOMAIN, {
          domain_name: domain.name,
          entries: data.data
        })
      })
    }
  }).catch(err => {
    console.log("error connecting to server. response:", err.response, "... getting backup data")
    // load_backup_init(store)
    // init_for_release_mode(store)
    store.commit(CONNECTING, false)
  })

  api.domain__$domain_name__basic_entries(NO_DOMAIN).then(({data}) => {
    store.dispatch(SET_TEMPLATES_CODES_FOR_DOMAIN, {
      domain_name: NO_DOMAIN,
      entries: data.data
    })
  }).catch((err) => {
    console.log("problem fetching no domain templates & codes")
    console.log(err)
  })

  if (route.name === "domain-domain") {
    // console.log("grabbing domain templates...")

    const config = {
      required: [
        {
          name: "meta",
          column: DOMAIN,
          conditional_value: route.params.domain
        }
      ]
    }

    const ts = new Date()
    api.entries_search(20, 0, config).then(({data}) => {

      const count = data.data.count
      const cachable_entries = data.data.entries
      const entry_uuids = []
      for (let entry of cachable_entries) {
        if (typeof entry === "object") {
          store.commit(ENTRIES_SAVE_ENTRY, entry)
          entry_uuids.push(entry.uuid)
        } else {
          entry_uuids.push(entry)
        }
      }
      store.commit(SEARCH_SET_ENTRIES, entry_uuids)
      store.commit(SEARCH_SET_SEARCH_COUNT, count)
      store.commit(SEARCH_SET_SEARCHTIME, ts)
      store.commit(SET_DOMAIN, this.domain)
      console.log("domain entries received!")
    }).catch(err => {
      console.log("problems fetching domains")
      console.log(err)
    })
  }

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



