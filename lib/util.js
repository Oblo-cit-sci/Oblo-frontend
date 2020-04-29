import {PRIVATE, PRIVATE_LOCAL, PUBLIC, VALUE} from "./consts";
import {ENTRIES_SAVE_ENTRY, ENTRIES_UPDATE_ENTRY} from "~/store/entries";

const ld = require("lodash")

export function mapToJson(map) {
  return JSON.parse(JSON.stringify([...map]))
}

export function jsonToMap(jsonStr) {
  return new Map(JSON.parse(jsonStr));
}

export function printDate(date) {
  return padStr(date.getDate()) + "/" +
    padStr(1 + date.getMonth()) + "/" +
    padStr(date.getFullYear())
}

export function printDateHours(date) {
  return printDate(date) + "-" +
    padStr(date.getHours()) + ":" +
    padStr(date.getMinutes())
}

function padStr(i) {
  return (i < 10) ? "0" + i : "" + i;
}

export function privacy_icon(privacy) {
  switch (privacy) {
    case PUBLIC:
      return "mdi-earth"
    case PRIVATE:
      return "mdi-lock"
    case PRIVATE_LOCAL:
      return "mdi-archive-outline"
    default: {
      console.log("ERROR , no privacy icon for", privacy)
      return "mdi-earth"
    }
  }
}

export function privacy_color(privacy) {
  switch (privacy) {
    case PUBLIC:
      return "#d3e6d0"
    case PRIVATE:
    case PRIVATE_LOCAL:
      return "#e6dbd0"
    default: {
      return null
    }
  }
}

export function review_color() {
  return "#e8a622"
}

export function recursive_unpack(data) {
  const i_val = data.hasOwnProperty(VALUE) ? data.value : data
  if (ld.includes(["string", "number"], typeof i_val)) {
    return i_val
  } else if (Array.isArray(i_val)) {
    return ld.map(i_val, inner => recursive_unpack(inner))
  } else if (typeof i_val === "object") {
    let result = {}
    ld.forEach(i_val, (val, key) => result[key] = recursive_unpack(val))
    return result
  }
}

export function recursive_unpack2(data) {
  let i_val = data
  while (typeof i_val === "object" && !Array.isArray(i_val) && i_val.hasOwnProperty(VALUE)) {
    i_val = i_val.value
    if (i_val === null) {
      return null
    }
  }
  if (["string", "number"].includes(typeof i_val)) {
    return i_val
  } else if (Array.isArray(i_val)) {
    return ld.map(i_val, inner => recursive_unpack(inner))
  } else if (typeof i_val === "object") {
    let result = {}
    ld.forEach(i_val, (val, key) => result[key] = recursive_unpack(val))
    return result
  }
}

export function filter_empty(obj_array) {
  return ld.filter(obj_array, o => !ld.isEmpty(o))
}

export function guarantee_array(data) {
  if (!Array.isArray(data)) {
    return [data]
  } else {
    return data
  }
}

export function load_eovalue_db(store) {
  console.log("loading databases...")
  const licci = []
  console.log("licci", licci.length)

  licci.forEach(entry => {
    entry.creation_datetime = new Date(entry.creation_datetime)
    entry.domain = "licci"
    store.commit(ENTRIES_SAVE_ENTRY, entry)
    store.dispatch(ENTRIES_UPDATE_ENTRY, entry.uuid)
  })

  const conecte_entries = require("./eovalue_dbs/conecte").slice(0, 2)
  console.log("conecte", conecte_entries.length)
  conecte_entries.forEach(entry => {
    entry.creation_datetime = new Date(entry.creation_datetime)
    entry.domain = "conecte"
    store.commit(ENTRIES_SAVE_ENTRY, entry)
    store.dispatch(ENTRIES_UPDATE_ENTRY, entry.uuid)
  })
}

export function static_file_path(store, file_path) {
  return store.app.context.base + file_path
}

// when using the collect aspect_loc function
export function flatten_collection_of_lists(collection) {
  const collected_val = collection.value
  let result_list = []
  for (let inner_list of collected_val) {
    let inner_val = inner_list.value
    if (Array.isArray(inner_val)) {
      for (let noneed of inner_val) {
        result_list.push(noneed)
      }
    } else {
      // TODO test
      result_list.push(inner_list)
    }
  }
  return result_list
}

export function route_change_query(route, new_query_params, replace_query = false, remove_paramms = []) {
  let query = replace_query ? new_query_params : Object.assign(ld.cloneDeep(route.query), new_query_params)
  for (let p of remove_paramms) {
    delete query[p]
  }
  return {
    path: route.path,
    query
  }
}

export function route_change_remove_query(route, remove_query_params) {
  const new_query = ld.cloneDeep(route.query)
  for (let to_remove of remove_query_params) {
    if (new_query.hasOwnProperty(to_remove))
      delete new_query[to_remove]
  }
  return {
    path: route.path,
    query: new_query
  }
}

export function base64file_to_blob(type, base64_file) {
  const pre_string_le = ("data:" + type + ";base64,").length
  const base64data = base64_file.substring(pre_string_le)
  const byteCharacters = atob(base64data)
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], {type: type})
}

const re_uuid = new RegExp('[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}')

export function check_str_is_uuid(val) {
  return re_uuid.test(val)
}

export function common_filesize(val, pot = "kB") {
  switch (pot) {
    case "kB":
      return val * 1000
    case "MB":
      return val * 1000000
    default:
      return val
  }
}

export function humanFileSize(bytes, si = true) {
  var thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
  var units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  var u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + ' ' + units[u];
}

export function env() {
  return process.env.NODE_ENV
}

export function dev_env() {
  return process.env.NODE_ENV === "development"
}
