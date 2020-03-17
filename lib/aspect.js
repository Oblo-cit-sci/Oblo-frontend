const ld = require("lodash")

import {
  ASPECT,
  COLLECT,
  COLLECT_CLOSE,
  COMPONENT, COMPOSITE, DATE,
  EDIT,
  ENTRY,
  ENTRY_COLLECT,
  ENTRY_COLLECT_CLOSE,
  ENTRY_COLLECT_LINK,
  ENTRY_INDEX,
  ENTRY_LINK_FOLLOW, ENTRYLIST, FLOAT,
  INDEX, INT, LOCATION,
  LINKED_ENTRY_INDEX,
  LINKED_INDEX, LIST, MULTISELECT, OPTIONS,
  PARENT, SELECT, STR, TREE,
  VIEW, IMAGES
} from "./consts";
import TextShortAspect from "../components/aspects/TextShortAspect"
import TextLongAspect from "../components/aspects/TextLongAspect"
import NumberAspect from "../components/aspects/NumberAspect"
import DateAspect from "../components/aspects/DateAspect"
import ListAspect from "../components/aspects/ListAspect"
import EntrylistAspect from "../components/aspects/EntrylistAspect"
import CompositeAspect from "../components/aspects/CompositeAspect"
import OptionsAspect from "../components/aspects/OptionsAspect"
import SelectAspect from "../components/aspects/SelectAspect"
import MultiSelect from "../components/aspects/MultiSelectAspect"
import TreeSelectAspect from "../components/aspects/TreeSelectAspect"
import BasicAspect from "../components/aspects/BasicAspect"
import UrlView from "../components/aspects/composite_views/UrlView"
import LocationAspect from "../components/aspects/LocationAspect";
import ImageAspect from "../components/aspects/ImageAspect";
import {ENTRY_ROLES, VIEW_COMPONENT} from "~/lib/consts";
import EntryRolesAspect from "~/components/aspects/EntryRolesAspect";
import {ENTRIES_VALUE} from "~/store/entries";


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

export function pack_value(value = null) {
  return {value: value}
}

export function unpack(value) {
  if (typeof value === "object") {
    return value.value
  } else {
    return value
  }
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

export function loc_prepend(atype, avalue, tail) {
  return ld.concat([[atype, avalue]], tail)
}

export function loc_append(prev, atype, avalue, aname) {
  let add = [atype, avalue]
  if (aname) {
    add.push(aname)
  }
  return ld.concat(prev, [add])
}

export function loc_remove_first(aspect_loc) {
  return aspect_loc.slice(1)
}

export function loc_remove_last(aspect_loc) {
  return aspect_loc.slice(0, aspect_loc.length - 1)
}

export function get_aspect_vue_component(aspect, mode = EDIT) {
  if (!aspect) {
    console.log("No Aspect!!")
    return BasicAspect
  }
  if(mode === VIEW && aspect.attr.hasOwnProperty(VIEW_COMPONENT)) {
      switch (aspect.attr.view_component) {
        case "url":
          return UrlView
      }
  }
  switch (aspect.type) {
    case STR:
      let max = aspect.attr.max || 8000 // or make this explicit in python
      if (max <= 100) {
        return TextShortAspect
      } else {
        return TextLongAspect
      }
    case INT:
    case FLOAT:
      return NumberAspect
    // case "@user":
    //   return SelectUserAspect
    case DATE:
      return DateAspect
    case LIST:
      return ListAspect
    case ENTRYLIST:
      return EntrylistAspect
    case COMPOSITE:
      if (mode === VIEW && aspect.view_type)
        return get_composite_view_component(aspect.view_type)
      else
        return CompositeAspect
    case OPTIONS:
      return OptionsAspect
    case SELECT:
      return SelectAspect
    case MULTISELECT:
      return MultiSelect
    case TREE:
      return TreeSelectAspect
    case LOCATION:
      return LocationAspect
    case IMAGES:
      return ImageAspect
    case ENTRY_ROLES:
      return EntryRolesAspect
    default:
      console.log("No Aspect component for", aspect.name, aspect.type)
      return BasicAspect
  }
}

function get_composite_view_component(name) {
  if (name === 'url') {
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

export function aspect_calced_value(aspect) {
  //if(aspect.attr.ref_value && aspect.attr.upd)
}

export function aspect_raw_default_value(aspect) {
  //console.log("aspect_raw_default_value", aspect)
  if (aspect.hasOwnProperty("attr")) {
    if (aspect.attr.hasOwnProperty("value")) {
      return aspect.attr.value
    }
  } else {
    console.log("warning. aspect has no ATTR", aspect.name)
  }
  try {
    return aspectTypeDefault(aspect.type, aspect)
  } catch (e) {
    console.log("cannot get default value of aspect", aspect.name, aspect)
    console.log(e)
    return null
  }
}


export function aspectTypeDefault(aspectType, aspect = null) {
  switch (aspectType) {
    case STR:
      return ""
    case LIST:
    case ENTRYLIST:
    case IMAGES:
      return []
    case COMPOSITE:
      let res = {}
      if(!aspect) {
        console.log("aspect default value of composites needs the whole aspect passed")
        return res
      }
      aspect.components.forEach(c => {
        res[c.name] = {value: aspect_raw_default_value(c)} //packed_aspect_default_value(c, {name: c.name})
      })
      return res
    case LOCATION:
    case SELECT:
    case MULTISELECT:
    case OPTIONS:
    case TREE:
    case "@user":
    case DATE:
    // todo could also check attr.min
    case INT:
    case FLOAT:
      return null
    //return ld.map(aspect.components, (c) => [c.name, packed_aspect_default_value(c, {name: c.name})]))
    default:
      console.log("Warning trying to ge default value of aspect-type of unknown type", aspect)
      return null
  }
}

export function packed_aspect_default_value(aspect) {
  return pack_value(aspect_raw_default_value(aspect))
}


export function aspect_loc_str(aspect_loc) {
  return ld.map(aspect_loc, al => al[0][0] + "-" + al[1]).join("_").replace(/[^_a-zA-Z0-9-]/g, "_")
}

export function remove_entry_loc(aspect_loc) {
  return ld.tail(aspect_loc)
}

export function check_condition_value(condition_value, condition) {
  if (!condition_value && condition.value !== null)
    if (condition.default_pass !== undefined)
      return condition.default_pass
    else
      return true
  else
    condition_value = condition_value.value


  //console.log("COND", condition_value, condition, typeof condition_value)
  // TODO dont parse to String but do proper comparison depending on aspect
  const compare = condition.compare || "equal"
  switch (compare) {
    case "equal":
      return condition_value === String(condition.value)
    case "unequal":
      //console.log("unequal", condition_value !== condition.value, typeof condition_value)
      return condition_value !== String(condition.value)
    case "contains":
      // this is more robust then the native indexof (and looks better) cuz lists are initially `null`
      return ld.includes(condition_value, condition.value)
  }
}

// todo: DEPRACATED or needs to move, still in use for export
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

export function disabled_by_condition(store, aspect, aspect_loc, item_index) {
  if (aspect.attr.hasOwnProperty("condition")) {

    let aspect_location = complete_aspect_loc(
      aspect_loc_uuid(aspect_loc),
      aspect_loc_str2arr(aspect.attr.condition.aspect),
      item_index) // todo index missing
    let condition_value = store.getters[ENTRIES_VALUE](aspect_location)
    return !check_condition_value(condition_value, aspect.attr.condition)
  } else {
    return false
  }
}

export function label(aspect) {
  if (aspect.label !== undefined) {
    return aspect.label
  } else {
    return aspect.name
  }
}

export function last_loc_value(aspect_loc) {
  return aspect_loc[aspect_loc.length - 1][1]
}

export function aspect_loc2aspect_descr_loc(aspect_loc) {
  return aspect_loc.map(loc => loc.length > 2 ? loc[2] : loc[1])
}

export function extract_unpacked_values(aspects) {
  const values = {}
  if (typeof aspects === "object") {
    if (aspects.constructor === Array) {
      for (let aspect of aspects) {
        values[aspect.name] = aspect.value
      }
    } else {
      for (let aspect of Object.entries(aspects)) {
        values[aspect.name] = aspect.value
      }
    }
  }
  return values
}


export function aspectBuilder(type, name, label = name, attr = {}) {
  return {
    name: name,
    type: type,
    attr: Object.assign(attr, {unpacked:true}),
    value: aspectTypeDefault(type)
  }
}

export function textAspectBuilder(name, label = name, attr_max) {
  const aspect = aspectBuilder(STR, name, label)
  if (label !== name) {
    aspect.label = label
  }
  if (attr_max) {
    aspect.attr.max = attr_max
  }
  return aspect
}


export function shortTextAspectBuilder(name, label = name, max_chars) {
  return textAspectBuilder(name, label, 90)
}

export function dateAspectBuilder(name, label) {
  return aspectBuilder(DATE, name, label)
}
