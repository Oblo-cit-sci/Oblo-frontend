import entry_types from "../lib/data_backups/types";
import codes from "../lib/data_backups/codes";
import domains from "../lib/data_backups/domains"
import {CONNECTING, CONNECTION, ENTRIES_ALL_ENTRIES_ARRAY, ENTRIES_VALUE, INIT} from "./store_consts";
import {create_entry} from "./entry"
import {ASPECT_SEARCH, ENTRY, TITLE} from "./consts";
import {aspect_loc_str2arr, loc_prepend} from "./aspect";
import {compare_aspect_value} from "./search";

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

// todo localsearch
/*

    iter of entries/entries

      search_in kw:
      check if kw: [title, description, ....]
      filter by lib/search has_meta_aspect with value

  config has a required list and include list
  required, need to pass all
  build result array: init empty
  run over all entries that pass req..
  check if they pass one of the the include configs

// for entry:
    check include configs
    + check search_in etype,metaaspect with the value in `aspect_search` (in the config)

 */

async function local_search(store, search_config) {
  let filtered_entries = store.getters[ENTRIES_ALL_ENTRIES_ARRAY]()
  let result = []
  let keyword_result = []
  /**
   * Default search by domain
   */
  for (let entry of filtered_entries) {
    const etype = store.getters["entry_type"](entry)
    if (etype.domain) {
      const aspect_value = {
        value: etype.domain
      }
      console.log(aspect_value, search_config.required.domain)
      if (compare_aspect_value(aspect_value, search_config.required.domain)) {
        result.push([entry.uuid, entry])
      }
    }
  }

  /**
   * Search by keyword
   */
  if (search_config.include.aspect_search) {
    for (let entry of result) {
      let entry_value = entry[1]
      //console.log("title", entry[TITLE])
      // do the include stuff
      // continue earlier if fullfiled
      const etype = store.getters["entry_type"](entry_value)
      //console.log(etype.content.meta)

      if (etype.content.meta.hasOwnProperty("search_in")) {
        //console.log(etype.content.meta.search_in)
        const search_in = etype.content.meta.search_in
        for (let aspect_loc_str of search_in) {
          const aspect_loc = loc_prepend(ENTRY, entry_value.uuid, aspect_loc_str2arr(aspect_loc_str))
          //console.log(aspect_loc)
          const value = store.getters[ENTRIES_VALUE](aspect_loc)
          if (compare_aspect_value(value, search_config.include.aspect_search)) {
            keyword_result.push([entry_value.uuid, entry_value])
          }
          //console.log("value", value, included)
        }
      }
    }
    result = keyword_result;
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
      store.commit("search/set_entries", res)
      return res
    }).catch(err => {
    store.commit("search/clear")
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

export async function initialize(axios, store, localForage) {

  reload_storage(store, localForage)

  try {
    store.commit(CONNECTING, true)
    axios.get("/init").then((resp) => {
      //console.log("result", resp)
      const data = resp.data
      store.commit(INIT, data.result)
      store.commit(CONNECTION, true)
      timeline_entries(axios).then(timeline => {
        store.commit("entries/add_timeline_entries", timeline.result)
      }).catch(err => {
        console.log("error getting timeline")
      })
    }).catch(err => {
      console.log("error connecting.getting backup data. response:", err.response)
      load_backup_init(store)
    })
  } catch (e) {
    load_backup_init(store)
  }
  store.commit(CONNECTING, false)
}

function reload_storage(store, localForage) {
  if (localForage) {

    localForage.getItem("entries").then((entries) => {
      if (entries) {
        store.commit("set_stored_entries", entries)
      }
    }).catch(err => {
      console.log("localForage error", err)
    })

    localForage.getItem("draft_numbers").then((draft_numbers) => {
      if (draft_numbers) {
        store.commit("set_draft_numbers", draft_numbers)
      }
    }).catch(err => {
      console.log("localForage error", err)
    })
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
  store.commit("backup_init", {
    entryTemplates: entry_types,
    codes: codes,
    domains: domains
  })
}



