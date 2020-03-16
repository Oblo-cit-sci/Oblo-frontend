import entry_types from "./data_backups/types";
import codes from "../lib/data_backups/codes";
import domains from "../lib/data_backups/domains"
import {CONNECTING, CONNECTION, DB_LOADED, INIT, SET_DOMAIN, USER_LOGGED_IN} from "./store_consts";
import {create_entry} from "./entry"

import {EOVALUE, LICCI_PARTNERS, NO_DOMAIN} from "./consts";
import {get_release_mode, load_eovalue_db} from "./util";
import {
  BACKUP_INIT,
  DELETE_DOMAIN, SET_DOMAINS
} from "~/lib/store_consts";
import {db_vars} from "~/lib/db_vars";
import {
  SEARCH_APPEND_ENTRIES,
  SEARCH_PREPEND_ENTRIES,
  SEARCH_SET_ENTRIES,
  SEARCH_SET_SEARCH_COUNT
} from "~/store/search";
import {ENTRIES_ALL_ENTRIES_ARRAY, ENTRIES_SAVE_ENTRY, ENTRIES_SIZE} from "~/store/entries";

const LOG = true

const pkg = require('../package')

const ld = require("lodash")


async function dummy_search(store) {
  let isStore = false
  let result = []
  for (let i = 0; i < 5; i++) {
    let entry = create_entry(store, 'site', {location: [Math.random() * 360 - 180, 40]}, null, isStore)
    result.push([entry.uuid, entry])
  }
  return result
}

export const debounced_search = ld.debounce(search_entries, 1000)

export function search_entries(api, store, config, offset = 0) {
  const domain_entry = ld.find(config.required, r => r.name === "meta" && r.column === "domain")
  if (domain_entry) {
    api.domain__$domain_name__entries(domain_entry.conditional_value,
      ld.get(config, "page.limit", 60), ld.get(config, "page.offset", offset),
      config)
      .then(({data}) => {
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
        if(offset === 0) {
          store.commit(SEARCH_SET_ENTRIES, entry_uuids)
          store.commit(SEARCH_SET_SEARCH_COUNT, count)
        } else {
          store.commit(SEARCH_APPEND_ENTRIES, entry_uuids)
        }
        store.commit("search/set_searching", false)
      }).catch(err => {
      console.log("search_entries err", err)
      store.commit("search/set_searching", false)
    })
  } else {
    api.entries_search(
      ld.get(config, "page.limit", 100),
      ld.get(config, "page.offset", 0), config).then(({data}) => {
      const count = data.data.count
      const entries = data.data.entries
      console.log("search done- count", count)
      if (prepend) {
        store.commit(SEARCH_PREPEND_ENTRIES, entries)
      } else {
        store.commit(SEARCH_SET_ENTRIES, entries)
      }
      store.commit(SEARCH_SET_SEARCH_COUNT, count)
      store.commit("search/set_searching", false)
    }).catch(err => {
      console.log("search error", err)
      store.commit("search/set_searching", false)
    })
    return {search: 1}
  }
  // move this to lib/search.js
  // local_search(store, config)
  //     .then(res => {
  //         //console.log(res)
  //         // console.log("local search setting entries")
  //         store.commit(SEARCH_SET_ENTRIES, res)
  //         return res
  //     }).catch(err => {
  //     store.commit(SEARCH_CLEAR)
  //     console.log("Couldn't find entries: ", err)
  //     return err
  // })

}

export async function timeline_entries(axios) {
  // console.log("calling recent_entries");
  return await axios.get(`/timeline`).then((res) => {
    return res.data;
  })
    .catch((e) => {
      return ({statusCode: 404, message: 'Post not found'})
    });
}

function init_for_release_mode(store) {
  if (get_release_mode(store) === LICCI_PARTNERS) {
    store.commit(DELETE_DOMAIN, "conecte")
    const licci_domain = store.state.domains.filter(domain => domain.value === "licci")[0]
    store.commit(SET_DOMAIN, licci_domain)
  } else {
    load_eovalue_db(store)
  }
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
        store.dispatch("set_templates_codes_for_domain", {
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
    store.dispatch("set_templates_codes_for_domain", {
      domain_name: NO_DOMAIN,
      entries: data.data
    })
  }).catch((err) => {
    console.log("problem fetching no domain templates & codes")
    console.log(err)
  })

  if (route.name === "domain-domain") {
    // console.log("grabbing domain templates...")
    api.domain__$domain_name__entries(route.params.domain, 20, 0).then(({data}) => {
      // console.log("tempaltes fetch res", data)
      store.dispatch("set_templates_codes_for_domain", {
        domain_name: route.params.domain,
        entries: data
      })
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
        console.log("db items: ", store_var_descr.name, store_var)
        if (store_var) {
          console.log(store_var.constructor)
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
  if(store.getters[ENTRIES_SIZE] === 0 && store.getters[USER_LOGGED_IN]) {
    console.log("clearing cache")
    api.actor_clear_cache().then(resp => {
      console.log("cache cleared")
    }).catch(err => {
      console.log("api error: actor_clear_cache")
    })
  }
}

function array_param(key, values) {
  return ld.map(values, v => key + "=" + v).join("&")
}


export async function get_entrytpe(store, type_slug, axios) {
  if (store.state.entry_types.has(type_slug)) {
    return store.state.entry_types.get(type_slug);
  } else {
    console.log("type not found", type_slug);
    let {data} = await axios.get("/entrytype", {
      params: {
        type_slug: type_slug
      }
    });
    // TODO make it a commit fct
    store.commit(ENTRYTYPE, data.result);
    return data.result;
  }
//  this.$store.getters.entrytype_aspects(this.entry.parent_type)// this.$store.state.entrytype_aspects(this.entry.parent_type, this.$store.state, this.$axios);
}

export function license_icon(router_base, axios, license_svg, store) {
  if (!store.state.connected)
    return router_base + license_svg
  else
    return server_icon_path(axios, license_svg)
}

export function server_static_file_path(axios, static_file_path) {
  return axios.defaults.baseURL + "/static/" + static_file_path
}

export function server_icon_path(axios, icon_sub_path) {
  return server_static_file_path(axios, "images/icons/" + icon_sub_path)
}

function load_backup_init(store) {
  let final_entry_types = new Map(entry_types)
  if (get_release_mode(store) === LICCI_PARTNERS) {
    final_entry_types = new Map(Array.from(entry_types).filter(etype => etype[1].domain === "licci"))
  }
  if (get_release_mode(store) === EOVALUE) {
    final_entry_types = entry_types.filter(etype => etype[1].slug !== "site")
  }
  store.commit(BACKUP_INIT, {
    entryTemplates: final_entry_types,
    codes: codes,
    domains: domains
  })
}


export function app_version() {
  return pkg.version
}

export async function upload(axios, url, data) {
  return axios.post(url, data, {
    headers: {
      "accept": "*",
      "Access-Control-Allow-Headers": "accept",
      'Access-Control-Allow-Origin': '*',
    }
  })
}




