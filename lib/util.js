import {PRIVATE, PRIVATE_LOCAL, PUBLIC} from "./consts";

export function mapToJson(map) {
  return JSON.parse(JSON.stringify([...map]))
}

export function jsonToMap(jsonStr) {
  return new Map(JSON.parse(jsonStr));
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

export function  privacy_icon(privacy) {
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
