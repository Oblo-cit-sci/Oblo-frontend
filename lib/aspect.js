const ld = require("lodash")

import {ASPECT, COLLECT, COMPONENT, EDIT, ENTRY, INDEX, LINKED_INDEX, PARENT, VIEW} from "./consts";
import TextShort from "../components/aspectInput/TextShort";
import TextLong from "../components/aspectInput/TextLong";
import NumberAspect from "../components/aspectInput/NumberAspect";
import DateAspect from "../components/aspectInput/DateAspect";
import Location from "../components/aspectInput/Location";
import List from "../components/aspectInput/List";
import ListOf from "../components/aspectInput/ListOf";
import CompositeAspect from "../components/aspectInput/CompositeAspect";
import OptionsAspect from "../components/aspectInput/OptionsAspect";
import Select from "../components/aspectInput/Select";
import MultiSelect from "../components/aspectInput/MultiSelectAspect";
import TreeSelect from "../components/aspectInput/TreeSelect";
import Basic from "../components/aspectInput/Basic";
import UrlView from "../components/aspectInput/composite_views/UrlView";


export const delim2str = {
  "&": ENTRY,
  "#": ASPECT,
  "@": COMPONENT,
  ".": INDEX,
  ";": LINKED_INDEX,
  "_": COLLECT,
  "%": PARENT
}

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

export function aspect_loc_str2arr(aspect_loc_str) {
  const als = aspect_loc_str.split("/")
  let res = []

  for(let l of als) {
    l = l.trim()
    res.push([delim2str[l[0]], l.substring(1).trim()])
  }
  return res
}

export function MAspectComponent(aspect, mode = EDIT) {
  switch (aspect.type) {
    case "str":
      let max = aspect.attr.max || 8000 // or make this explicit in python
      if (max <= 100) {
        return TextShort
      } else {
        return TextLong
      }
    case "int":
    case "float":
      return NumberAspect
    // case "@user":
    //   return SelectUser
    case "date":
      return DateAspect
    case "gps":
      return Location
    case "list":
      return List
    case "entrylist":
      return ListOf
    case "composite":
      if (mode === VIEW && aspect.view_type)
        return composite_views(aspect.view_type)
      else
        return CompositeAspect
    case "options":
      return OptionsAspect
    case "select":
      return Select
    case "multiselect":
      return MultiSelect
    case "tree":
      return TreeSelect
    default:
      console.log("No Aspect component for", aspect.name, aspect.type, aspect.type === "options")
      return Basic
  }
}

function composite_views(name) {
  if (name === "url") {
    return UrlView;
  } else
    return CompositeAspect;
}

export function aspect_default_value(store, aspect) {
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
        return new Date()
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
