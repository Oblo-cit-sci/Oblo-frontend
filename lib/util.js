import {PRIVATE, PRIVATE_LOCAL, PUBLIC, VALUE} from "./consts";

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
    padStr(date.getHours()) + ":"
  padStr(date.getMinutes())
}

function padStr(i) {
  return (i < 10) ? "0" + i : "" + i;
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
