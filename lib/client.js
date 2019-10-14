const ld = require("lodash");

const pkg = require('../package')


import entry_types from "../lib/data_backups/types";
import codes from "../lib/data_backups/codes";
import {
  EDIT,
  ENTRY,
  ENTRY_INDEX,
  INDEX,
  LINKED_ENTRY_INDEX,
  LINKED_INDEX,
  PRIVATE,
  PRIVATE_LOCAL,
  PUBLIC,
  VISITOR
} from "./consts";
import {CONNECTING, CONNECTION, INIT} from "./store_consts";
import { create_entry } from "./entry"


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
  for(let i=0; i<5; i++) {
    let entry = create_entry(store, 'site', {}, null, isStore)
    result.push([entry.uuid, entry])
  }
  return result
}
export async function search_entries(axios, store, keyword) {
  
  dummy_search(store).then(res => {
    store.commit('search/set_entries', res)
    return res
  }).catch(err => {
    console.log(err)
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


export async function initialize(axios, store) {
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


export function string2option(s) {
  return {text: s, value: s}
}

// todo check where its needed and evtl move
export function string_list2options(values) {
  return ld.map(values, s => {
    return string2option(s)
  })
}

// todo if this would be with locators, it would also work for composites
export function object_list2options(values, text_from, value_from, clean = false) {
  return ld.map(values, (c) => {
    return Object.assign(clean ? {} : c, {text: c["text"] || c[text_from], value: c["value"] || c[value_from]})
  })
}

export function no_duplicate_texts(options, text_key = "text") {
  let strings = ld.map(options, o => o[text_key])
  strings = no_duplicate_string(strings)
  for (let i = 0; i < strings.length; i++) {
    options[i][text_key] = strings[i]
  }
}

export function no_duplicate_string(strings) {
  let count = {}
  let re_added = {}
  let results = []

  const counter = (obj, s) => {
    if (obj.hasOwnProperty(s)) {
      obj[s] += 1
    } else {
      obj[s] = 1
    }
  }

  strings.forEach(s => counter(count, s))
  for (let i = 0; i < strings.length; i++) {
    let s = strings[i]
    if (count[s] > 1) {
      counter(re_added, s)
      s += " (" + re_added[s] + ")"
    }
    results.push(s)
  }

  // strings.forEach(s => {
  //   if (count[s] > 1) {
  //     counter(re_added, s)
  //     s += " (" + re_added[s] + ")"
  //   }
  //   results.push(s)
  // }

  return results
}

export function composite_list2options(composite_values) {
  return ld.map(composite_values, (c) => {
    return {text: c.value[0].value, value: c.value[1].value}
  })
}

export function get_codes_as_options(state, code_name) {
  code_name = code_name.substring(1)
  const code_parts = code_name.split("/")
  let codes_raw = state.codes
  // todo, here fetch if missing, but rather then this, make sure that for all used templates, all codes are downloaded
  for (let part of code_parts) {
    codes_raw = codes_raw[part]
    if (!codes_raw) {
      console.log("part:", part, "is missing in", code_name)
      return []
    }
  }
  // todo
  // there could be a catch that the code does not exist, but that should be handled
  // also on the backend
  // but still, ....

  // TODO this will be default later
  if (codes_raw.hasOwnProperty("type_slug")) {
    if (codes_raw.type_slug === "valuemap") {
      return composite_list2options(codes_raw.aspects_values.values.value)
    }
  }
  return string_list2options(codes_raw)
}


export function get_from_store_location(store, location) {
  let data = store.state
  for (let loc of location) {
    if (!data.hasOwnProperty(loc)) {
      console.log("get_from_store_location failed", location, loc, "not found. options are", Object.keys(data))
      return {}
    } else {
      const data_type = data.constructor
      if (data_type === Object) {
        data = data[loc]
      } else if (data_type === Map) {
        data = data.get(loc)
      }
    }
  }
  return data
}

export function mapToJson(map) {
  return JSON.parse(JSON.stringify([...map]))
}


export function jsonToMap(jsonStr) {
  return new Map(JSON.parse(jsonStr));
}

export function complete_aspect_loc(uuid, no_entry_aspect_loc, index = null) {
  if (index !== null) {
    no_entry_aspect_loc = ld.map(no_entry_aspect_loc, e => {
      if (e[0] === LINKED_INDEX) {
        return [INDEX, index]
      } else if (e[0] === LINKED_ENTRY_INDEX) {
        return [ENTRY_INDEX, index]
      } else {
        return e
      }
    })
  }
  return ld.concat([[ENTRY, uuid]], no_entry_aspect_loc)
}

export function aspect_loc_uuid(aspect_loc) {
  return aspect_loc[0][1]
}

export function printDate(date) {
  return padStr(date.getFullYear()) +
    padStr(1 + date.getMonth()) +
    padStr(date.getDate()) + "-" +
    padStr(date.getHours()) +
    padStr(date.getMinutes())
}

function padStr(i) {
  return (i < 10) ? "0" + i : "" + i;
}

export function load_backup_init(store) {
  store.commit("backup_init", {
    entryTemplates: entry_types,
    codes: codes,
  })
}

export function user_ref(user_data) {
  let ref = {
    registered_name: user_data.registered_name,
    public_name: user_data.public_name
  }
  if (user_data.global_role === VISITOR) {
    ref.uid = user_data.uid
  }
  return ref
}

// TODO fix, make simpler, maybe move to const
export const CREATOR = {key: "CREATOR", actors_key: "creator"}
export const PRIME_OWNER = {key: "PRIME_OWNER", actors_key: "owners"}
export const OWNERS = {key: "OWNERS", actors_key: "owners"}
export const REVIEWERS = {key: "REVIEWERS", actors_key: "reviewers"}
export const EXPLICIT_ACCESS = {key: "EXPLICIT_ACCESS", actors_key: "explicit_access"}
export const COLLABORATOR = {key: "COLLABORATOR", actors_key: "collaborator"}

const ActorEntryRelations = [OWNERS, EXPLICIT_ACCESS, COLLABORATOR]

export function entry_actor_relation(entry, user) {
  let identity = (eu) => {
    return user.global_role !== VISITOR ?
      eu.registered_name === user.registered_name :
      eu.uid === user.uid
  }
  const actors = entry.actors
  if (identity(actors.creator))
    return CREATOR.key
  else {
    for (let ae_relation of ActorEntryRelations) {
      let in_group = ld.findIndex((actors[ae_relation.key] || []), (e_a) => identity(e_a))
      if (in_group !== -1)
        if (ae_relation.key === OWNERS.key && in_group === 0) {
          return PRIME_OWNER.key
        } else {
          return ae_relation.key
        }
    }
  }
}

export function privacy_icon(privacy) {
  switch (privacy) {
    case PUBLIC:
      return "public"
    case PRIVATE:
      return "lock"
    case PRIVATE_LOCAL:
      return "fa-archive"
    default: {
      console.log("ERROR , no privacy icon for", privacy)
      return "public"
    }
  }

}

export function flatten_tree_to_options(tree, options = {}) {
  // configurable for now:
  // options can have include_levels: an array of ints
  // it will then take these levels (level 0 included)
  // otherwise it will only take the leaves
  const include_levels = options.include_levels || null
  //const remain_position = options.remain_position || false

  let result = []


  let lf = function (level, i = 0) {
    if (include_levels) {
      if (include_levels.indexOf(i) !== -1) {
        result.push(level.name) // maybe also value
      }
    } else {
      if (!level.hasOwnProperty("children")) {
        result.push(level.name) // maybe also value
      }
    }
    for (let item of level.children || []) {
      lf(item, i + 1)
    }
  }
  lf(tree)
  return result
}

export function media_query() {
  const w = screen.width
  switch (w) {
    case w < 599:
      return "xs"
    case w < 1023:
      return "sm"
    case w < 1439:
      return "md"
    case w < 1919:
      return "lg"
    default:
      return "xl"
  }
}


