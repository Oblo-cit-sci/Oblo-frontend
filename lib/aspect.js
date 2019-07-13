import {ASPECT, COLLECT, ENTRY, INDEX} from "./consts";

export function pack_value(value) {
  return {value: value}
}

export function unpack(value) {
  return value.value
}

export function aspect_label(aspect) {
  if (aspect.label !== undefined) {
    return aspect.label
  } else {
    return aspect.name
  }
}

const aspect_loc_str_delim = ["#", ".", "_"]
const delims = aspect_loc_str_delim.join()
const delim2str = {
  "&": ENTRY,
  "#": ASPECT,
  ".": INDEX,
  "_": COLLECT

}

export function aspect_loc_str2arr(aspect_loc_str) {
  const als = aspect_loc_str
  let next = []
  let res = []
  let word = ""
  for (let ci in als) {
    const c = str[ci]
    if (delims.includes(c)) {
      res.push(next)
      next = new Array([delim2str[c]])
      word = ""
    } else {
      word += c
    }
  }
  return res
}