import entry_types from "../lib/data_backups/types";
import codes from "../lib/data_backups/codes";
import domains from "../lib/data_backups/domains"
import {CONNECTING, CONNECTION, INIT, SET_DOMAIN} from "./store_consts";
import {create_entry} from "./entry"
import {local_search} from "./search";
import {EOVALUE, LICCI_PARTNERS} from "./consts";
import {get_release_mode, load_eovalue_db} from "./util";

const ld = require("lodash")

const pkg = require('../package')

export function complete_activities(entryType, step, aspect_values) {
  /*
  curcial symbols:
  #Bla refers to the aspect value.
  depending on the type, it will select, slug:... or uuid:...
  BUT THIS IS HAPPENEING ON THE SERVER SO, THEY STAY

  @self
  is the user: so it will insert: registered_name
  although again, the server can take care of that. maybe it verifies

  this.... can modify the data model e.g. assigning reviewers, owners, ...


  step: says what triggered the activity (e.g. send)
  */
  //console.log("complete!", entryType, aspect_values);

  if (!entryType.content.hasOwnProperty("activities")) {
    return {}
  } else {
    !entryType.content.activities.hasOwnProperty(step)
    // here more processing?
    return entryType.content.activities[step];
  }
}

async function dummy_search(store) {
  let isStore = false
  let result = []
  for (let i = 0; i < 5; i++) {
    let entry = create_entry(store, 'site', {location: [Math.random() * 360 - 180, 40]}, null, isStore)
    result.push([entry.uuid, entry])
  }
  return result
}


export async function search_entries(axios, store, config) {
  /*
  dummy_search(store).then(res => {
    store.commit('search/set_entries', res)
    return res
  }).catch(err => {
    console.log(err)
  })
  */
  local_search(store, config)
    .then(res => {
      //console.log(res)
      store.commit("search/set_entries", res)
      return res
    }).catch(err => {
    store.commit("search/clear")
    console.log("Couldn't find entries: ", err)
    return err
  })
  // return await axios.get(`/entries`,{
  //  params: {
  //    keyword: keyword
  //  }
  // }).then((res) => {
  //  store.commit("search/set_entries", res)
  //  })
  // .catch((e) => {
  //    return ({statusCode: 404, message: 'Not found'})
  //  });
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
    //console.log("setting domain to licci from", store.state.domains)
    store.commit("delete_domain", "conecte")
    const licci_domain = store.state.domains.filter(domain => domain.value === "licci")[0]
    store.commit(SET_DOMAIN, licci_domain)
  } else {
    load_eovalue_db(store)
  }
}

export async function initialize(axios, store, localForage) {
  reload_storage(store, localForage)
  try {
    store.commit(CONNECTING, true)
    //console.log("connecting")
    axios.get("/init").then((resp) => {
      console.log("connected")
      const data = resp.data
      store.commit(INIT, data.result)
      store.commit(CONNECTION, true)

      /*
      timeline_entries(axios).then(timeline => {
        store.commit("entries/add_timeline_entries", timeline.result)
      }).catch(err => {
        console.log("error getting timeline")
      })*/
      init_for_release_mode(store)
    }).catch(err => {
      console.log("error connecting to server. response:", err.response, "... getting backup data")
      load_backup_init(store)
      init_for_release_mode(store)
    })
  } catch (e) {
    console.log("SOMETHING WENT WRONG DURING INITIALIZATION")
  }

  store.commit(CONNECTING, false)
}

function reload_storage(store, localForage) {

  // TODO move this stuff into lib/browser_db
  // console.log("reload_storage", localForage)
  if (localForage) {
    localForage.getItem("entries").then(entries => {
      // console.log("db entries: #", entries.size)
      if (entries && entries.size > 0) {
        store.commit("set_stored_entries", entries)
      }
    }).catch(err => {
      console.log("localForage error", err)
    })

    localForage.getItem("draft_numbers").then(draft_numbers => {
      if (draft_numbers) {
        store.commit("set_draft_numbers", draft_numbers)
      }
    }).catch(err => {
      console.log("localForage error", err)
    })

    localForage.getItem("user_key").then(user_key => {
      if (user_key) {
        store.commit("add_meta", {
          repository: {
            user_key: user_key
          }
        })
      }
    }).catch(err => {
      console.log("localForage error", err)
    })

    /*
    localForage.getItem("domain").then(domain => {
      if (domain) {
        console.log("setting domain from storage...")
        store.commit(SET_DOMAIN, domain)
      }
    }).catch(err => {
      console.log("localForage error", err)
    })
     */
  }
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
    store.commit("entrytype", data.result);
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

export function server_icon_path(axios, icon_sub_path) {
  return axios.defaults.baseURL + "/f/icons/" + icon_sub_path;
}

function load_backup_init(store) {
  let final_entry_types = entry_types

  if (get_release_mode(store) === LICCI_PARTNERS) {
    final_entry_types = entry_types.filter(etype => etype[1].domain === "licci")
  }
  if (get_release_mode(store) === EOVALUE) {
    final_entry_types = entry_types.filter(etype => etype[1].slug !== "site")
  }


  //console.log("loading etypes")
  store.commit("backup_init", {
    entryTemplates: final_entry_types,
    codes: codes,
    domains: domains
  })
  //console.log("done load_backup_init")
}


export function app_version() {
  return pkg.version
}
