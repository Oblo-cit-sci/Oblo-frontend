const ld = require("lodash")

import {
  ASPECT,
  COLLECT, COLLECT_CLOSE,
  COMPONENT,
  EDIT,
  ENTRY, ENTRY_COLLECT, ENTRY_COLLECT_CLOSE, ENTRY_COLLECT_LINK,
  ENTRY_INDEX, ENTRY_LINK_FOLLOW,
  INDEX,
  LINKED_ENTRY_INDEX,
  LINKED_INDEX,
  PARENT,
  VIEW
} from "./consts";
import TextShortAspect from "../components/aspects/TextShortAspect"
import TextLongAspect from "../components/aspects/TextLongAspect"
import NumberAspect from "../components/aspects/NumberAspect"
import DateAspect from "../components/aspects/DateAspect"
import LocationAspect from "../components/aspects/LocationAspect"
import ListAspect from "../components/aspects/ListAspect"
import EntrylistAspect from "../components/aspects/EntrylistAspect"
import CompositeAspect from "../components/aspects/CompositeAspect"
import OptionsAspect from "../components/aspects/OptionsAspect"
import SelectAspect from "../components/aspects/SelectAspect"
import MultiSelect from "../components/aspects/MultiSelectAspect"
import TreeSelectAspect from "../components/aspects/TreeSelectAspect"
import BasicAspect from "../components/aspects/BasicAspect"
import UrlView from "../components/aspects/composite_views/UrlView"


export const delim2str = {
  // EDIT IS INSERTED BY THE ACT ENTRY BUT NOT USED IN DESCRIPTIONS (yet)
  "&": ENTRY,
  "#": ASPECT,
  "@": COMPONENT,
  ".": INDEX,
  ";": LINKED_INDEX,
  "~": LINKED_ENTRY_INDEX,
  ":": ENTRY_INDEX,
  "(": COLLECT,
  ")": COLLECT_CLOSE,
  "[": ENTRY_COLLECT,
  "]": ENTRY_COLLECT_CLOSE,
  ">": ENTRY_COLLECT_LINK,
  "<": ENTRY_LINK_FOLLOW,
  "%": PARENT
}

export function pack_value(value) {
  return {value: value}
}

export function unpack(value) {
  return value.value
}


export function aspect_loc_str2arr(aspect_loc_str) {
  const als = aspect_loc_str.split("/")
  let res = []

  for (let l of als) {
    l = l.trim()
    const delim_char = l[0]
    res.push([delim2str[delim_char], l.substring(1).trim()])
  }
  return res
}

export function get_aspect_component(aspect, mode = EDIT) {
  if (!aspect) {
    console.log("No Aspect!!")
    return BasicAspect
  }
  switch (aspect.type) {
    case "str":
      let max = aspect.attr.max || 8000 // or make this explicit in python
      if (max <= 100) {
        return TextShortAspect
      } else {
        return TextLongAspect
      }
    case "int":
    case "float":
      return NumberAspect
    // case "@user":
    //   return SelectUserAspect
    case "date":
      return DateAspect
    case "gps":
      return LocationAspect
    case "list":
      return ListAspect
    case "entrylist":
      return EntrylistAspect
    case "composite":
      if (mode === VIEW && aspect.view_type)
        return get_composite_view_component(aspect.view_type)
      else
        return CompositeAspect
    case "options":
      return OptionsAspect
    case "select":
      return SelectAspect
    case "multiselect":
      return MultiSelect
    case "tree":
      return TreeSelectAspect
    default:
      console.log("No Aspect component for", aspect.name, aspect.type)
      return BasicAspect
  }
}

function get_composite_view_component(name) {
  if (name === "url") {
    return UrlView;
  } else
    return CompositeAspect;
}

export function aspect_default_value(aspect) {
  try {
    //console.log("aspect_default_value", aspect)
    if (aspect.attr.value) {
      return {value: aspect.attr.value}
    } else {
      return packed_aspect_default_value(aspect)
    }
  } catch (e) {
    console.log("ERROR. entry.default_values fails on aspect", aspect.name, " attr missing. not so bad tho. gonna set it anyway")
    return packed_aspect_default_value(aspect)
  }
}

export function aspect_raw_default_value(aspect) {
  //console.log("aspect_raw_default_value", aspect.name, aspect)
  try {
    switch (aspect.type) {
      case "str":
        return ""
      case "int":
        // todo could also check attr.min
        return null
      case "float":
        return null
      case "@user":
        return null
      case "date":
        return ""//new Date()
      case "gps":
        return null
      case "list":
        return []
      case "entrylist":
        return []
      case "tree":
        return null
      case "composite":
        let res = {}
        aspect.components.forEach(c => {
          res[c.name] = {value: aspect_raw_default_value(c)} //packed_aspect_default_value(c, {name: c.name})
        })
        return res
      //return ld.map(aspect.components, (c) => [c.name, packed_aspect_default_value(c, {name: c.name})]))
      case "options":
        return null
      case "select":
        return null
      case "multiselect":
        return null
      default:
        console.log("Warning trying to ge default value of aspect of unknown type", aspect)
        return null
    }
  } catch (e) {
    console.log("cannot get default value of aspect", aspect.name, aspect)
    return null
  }
}

export function packed_aspect_default_value(aspect) {
  return pack_value(aspect_raw_default_value(aspect))
}

// TODO depracated, but replace is usefull?
export function aspect_loc_str(aspect_loc) {
  return ld.map(aspect_loc, al => al[0][0] + "-" + al[1]).join("_").replace(/[^_a-zA-Z0-9-]/g, "_")
}

export function check_condition_value(condition_value, condition) {
  if (!condition_value)
    return true
  else
    condition_value = condition_value.value

  const compare = condition.compare || "equal"
  switch (compare) {
    case "equal":
      return condition_value === condition.value
    case "unequal":
      return condition_value !== condition.value
  }
}
