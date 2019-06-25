import {get_local_entry} from "./entry";

const ld = require("lodash");

const FileSaver = require('file-saver');

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
    console.log("init")
    let {data} = await axios.get("/init")
    //console.log("init data", data)
    store.commit("init", data.result)
    // todo should be another function... since it needs more frequent updates...
    let timeline = await timeline_entries(axios)
    // todo strange...
    //console.log("INIT", data.result.own_entries)
    store.commit("entries/add_timeline_entries", timeline.result)
    store.commit("connection", true)
    store.commit("entries/set_own_entries", data.result.own_entries)
    if (store.state.user.user_data.registered_name === "visitor") {
      if (data.result.user_data) {
        store.commit("user/login", data.result)
      }
    }
    return true
  } catch (e) {
    console.log("error", e)
    //console.log("store",store.state.user)
    //console.log("data", data.result.user_data)
    store.commit("connection", false)
    return false
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

export function license_icon(axios, license, store) {
  if (store.state.codes.hasOwnProperty("licenses")) {
    let license_data = store.state.codes.licenses[license];
    if (license_data !== undefined) {
      //console.log(license_data.svg);
      return server_icon_path(axios, license_data.svg);
    } else {
    }
  } else return "";
}

export function server_icon_path(axios, icon_sub_path) {
  return axios.defaults.baseURL + "/f/icons/" + icon_sub_path;
}

export function strip_default_aspects(aspects) {
  // todo findout why the object keys are numbers, conversion from map to object?.
  // anyway empty
  const drop = ["title", "description"];
  return ld.filter(aspects, (o) => {
    return drop.indexOf(o.name) === -1
  });
}

export function draft_url(state, draft_id) {
  const draft = state.edrafts.drafts[draft_id];
  return "/create/" + draft.type_slug + "/" + draft_id;
}

// todo check where its needed and evtl move
export function string_list2options(values) {
  return ld.map(values, (c) => {
    return {text: c, value: c}
  })
}

export function object_list2options(values, text_from, value_from) {
  return ld.map(values, (c) => {
    return Object.assign(c, {text: c[text_from], value: c[value_from]})
  })
}

export function get_codes_as_options(state, code_name) {
  code_name = code_name.substring(1)
  const code_parts = code_name.split("/")
  let codes_raw = state.codes
  for (let part of code_parts) {
    codes_raw = codes_raw[part]
  }
  return string_list2options(codes_raw)
}

export function check_conditions(entry_type) {
  // could be attr.condition or items="#..."
  const aspects = entry_type.content.aspects
  let relations = {} // key: which one, value: receives which other value, k -> v
  for (let aspect of aspects) {
    // TODO MAGIC prop
    try {
      if (aspect.attr.hasOwnProperty("condition")) {
        console.log(aspect.attr.condition.aspect, "->", aspect.name)
        relations[aspect.attr.condition.aspect] = aspect.name
      }
    } catch (e) {
      console.log("check condition exception, probably no attr on aspect", aspect.name, aspect)
    }
  }
  return relations
}

export function check_internallinks(entry_type) {

}


// better version in edraft store package
export function resolve_aspect_ref(store, entry, aspect_descr) {
  if (aspect_descr.attr.value) {
    const val = aspect_descr.attr.value
    if (val.startsWith("#")) { // a reference attribute
      let access = val.split(".")
      let select = entry
      let select_type = "entry"
      //let history = [select]
      if (access[0].length > 1) { // first access is # and eventual one or more "/"
        // for now we assume its all just "/" chars
        for (let up of Array(access[0].length - 1).keys()) {
          select = store.state.entries.entries.get(select.ref.uuid)
          //history.push(select)
        }
      }
      access.splice(0, 1)
      for (let c of access) {
        if (select_type === "entry") {
          select = select.aspects_values[c]
          //history.push(select)
          select_type = "aspect"
        }
        // todo
        if (select_type === "aspect") {
          // here composite and list access
        }
      }
      if (select_type === "aspect") {
        console.log("lib/client/resolve_asp_ref", select)
        return JSON.parse(JSON.stringify(select))
      } else {
        return null
      }
    }
  }
}

// TODO this should actually be a getter in the drafts, entry store
export function get_entries_of_type(store, type) {
  //let relevant_draftsA = store.getters["edrafts/all_drafts"]
  //console.log("teee", relevant_draftsA)
  let relevant_drafts = ld.filter(store.state.edrafts.drafts, (d) => {
    return d.type_slug === type
  })
  // let relecant_drafts = store.getters.drafts_by_slug
  let relevant_entries = ld.filter(store.state.entries.fetched_entries, (d) => {
    return d.type_slug === type
  })
  return relevant_drafts
}

// TODO this should actually be a getter in the drafts, entry store
export function get_draft_by_id(store, draft_id) {
  return ld.find(store.state.edrafts.drafts, (d) => {
    return d.draft_id === draft_id
  })
}

export function entries_as_options(entries) {
  return ld.map(entries, (e) => {
    return {text: e.title, value: e.entry_id}
  })
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


export function export_data(data, filename) {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    {type: "text/json;charset=utf-8"});
  FileSaver.saveAs(blob, filename);
}

export function printDate(date) {
  return padStr(date.getFullYear())  +
    padStr(1 + date.getMonth()) +
    padStr(date.getDate()) + "-" +
    padStr(date.getHours()) +
    padStr(date.getMinutes())
}

function padStr(i) {
  return (i < 10) ? "0" + i : "" + i;
}
