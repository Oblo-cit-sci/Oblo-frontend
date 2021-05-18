import SimpleTextView from "~/components/aspect_utils/SimpleTextView"
import {
  ASPECT,
  COLLECT,
  COLLECT_CLOSE,
  COMPONENT,
  COMPOSITE,
  DATE,
  EDIT,
  ENTRY,
  ENTRY_COLLECT,
  ENTRY_COLLECT_CLOSE,
  ENTRY_COLLECT_LINK,
  ENTRY_INDEX,
  ENTRY_LINK_FOLLOW,
  ENTRYLIST, EXTERNAL_ACCOUNT,
  FLOAT,
  IMAGES,
  INDEX,
  INT,
  LINKED_ENTRY_INDEX,
  LINKED_INDEX,
  LIST,
  LOCATION,
  MULTISELECT,
  OPTIONS,
  PARENT,
  SELECT,
  SIMPLETEXTVIEW,
  STR,
  TREE, VALUE,
  VIEW
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
import {ENTRY_ROLES, ENTRYLINK, HEAD, TREEMULTISELECT, VIEW_COMPONENT} from "~/lib/consts";
import EntryRolesAspect from "~/components/aspects/EntryRolesAspect";
import TreeMultiSelectAspect from "~/components/aspects/TreeMultiSelectAspect"
import BareHeadAspect from "~/components/aspects/BareHeadAspect"
import EntryLink from "~/components/util/EntryLink"
import TagOptions from "~/components/aspects/edit_components/TagOptions"
import SelectGrid2 from "~/components/aspect_utils/SelectGrid2"
import {recursive_unpack2} from "~/lib/util";
import {select_aspect_loc} from "~/lib/entry";
import ExternalAccountAspect from "~/components/aspects/ExternalAccountAspect";

const ld = require("lodash")


export const delim2str = {
  // EDIT IS INSERTED BY THE ACT ENTRY BUT NOT USED IN DESCRIPTIONS (yet)
  "$": "NEW_LOC_FORMAT", // see entries.direct_select
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
  // console.log(typeof value)
  if (typeof value === "object" && value !== null) {
    if (value.hasOwnProperty("value")) {
      return value.value
    } else if (Array.isArray(value)) {
      return value
    } else {
      console.trace()
      console.error("Cannot unpack", value)
      return value
      // return value
    }
  } else {
    return value
  }
}

export function is_packed(value) {
  return (typeof value === "object" && value.hasOwnProperty("value"))
}


export function aspect_loc_str2arr(aspect_loc_str, list_index = null, debug = false) {
  const als = aspect_loc_str.split("/")
  let res = []
  if (debug)
    debugger
  for (let l of als) {
    l = l.trim()
    const delim_char = l[0]
    const atype = delim2str[delim_char]
    if (atype === LINKED_INDEX && list_index !== undefined) {
      res.push([INDEX, list_index])
    } else {
      res.push([atype, l.substring(1).trim()])
    }
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

function aspect_attr(aspect) {
  return ld.get(aspect, "attr", {})
}

export function get_aspect_vue_component(aspect, mode = EDIT) {
  if (!aspect) {
    console.log("No Aspect!!")
    return BasicAspect
  }
  const attr = aspect_attr(aspect)
  if (mode === VIEW && attr.hasOwnProperty(VIEW_COMPONENT)) {
    switch (attr.view_component) {
      case "url":
        return UrlView
    }
  } else if (mode === EDIT && attr.edit_component) {
    switch (attr.edit_component) {
      case "tag_options":
        return TagOptions
      case "new-grid-select":
        return SelectGrid2
    }
  }
  switch (aspect.type) {
    case STR:
      let max = attr.max || 8000 // or make this explicit in python
      if (max <= 100) {
        return TextShortAspect
      } else {
        return TextLongAspect
      }
    case HEAD:
      return BareHeadAspect
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
    case TREEMULTISELECT:
      return TreeMultiSelectAspect
    case LOCATION:
      return LocationAspect
    case IMAGES:
      return ImageAspect
    case ENTRY_ROLES:
      return EntryRolesAspect
    case SIMPLETEXTVIEW:
      return SimpleTextView
    case ENTRYLINK:
      return EntryLink
    case EXTERNAL_ACCOUNT:
      return ExternalAccountAspect
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

export function attr(aspect) {
  return aspect.attr || {}
}

export function aspect_default_value(aspect) {
  try {
    const fixed_value = attr(aspect).value
    //console.log("aspect_default_value", aspect)
    if (fixed_value) {
      return pack_value(fixed_value)
    }
    return packed_aspect_default_value(aspect)
  } catch (e) {
    console.log("ERROR. entry.default_values fails on aspect", aspect.name, " attr missing. not so bad tho. gonna set it anyway")
    return packed_aspect_default_value(aspect)
  }
}

export function aspect_raw_default_value(aspect) {
  //console.log("aspect_raw_default_value", aspect)
  if (attr(aspect).hasOwnProperty(VALUE)) {
    return aspect.attr.value
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
    case SIMPLETEXTVIEW:
    case TREE:
    case MULTISELECT:
      return []
    case COMPOSITE:
      let res = {}
      if (!aspect) {
        console.log("aspect default value of composites needs the whole aspect passed")
        return res
      }
      aspect.components.forEach(c => {
        res[c.name] = {value: aspect_raw_default_value(c)} //packed_aspect_default_value(c, {name: c.name})
      })
      return res
    case HEAD:
    case LOCATION:
    case SELECT:
    case OPTIONS:
    case TREEMULTISELECT:
    case DATE:
    // todo could also check attr.min
    case INT:
    case FLOAT:
    case ENTRYLINK:
    case ENTRY_ROLES:
    case EXTERNAL_ACCOUNT:
      return null
    //return ld.map(aspect.components, (c) => [c.name, packed_aspect_default_value(c, {name: c.name})]))
    default:
      console.log("Warning trying to ge default value of aspect-type of unknown type", aspect)
      console.trace()
      return null
  }
}

export function packed_aspect_default_value(aspect) {
  return pack_value(aspect_raw_default_value(aspect))
}


export function aspect_loc_str(aspect_loc) {
  return ld.map(aspect_loc, al => al[0][0] + "-" + al[1]).join("_").replace(/[^_a-zA-Z0-9-]/g, "_")
}

export function aspect_loc2jsonpath(aspect_loc) {
  return ld.reduce(
    aspect_loc, (jsonpath, al) => {
      if ([EDIT, ENTRY].includes(al[0]))
        return "$"
      else if ([ASPECT, COMPONENT].includes(al[0]))
        return jsonpath + "." + al[1]
      else if (al[0] === INDEX)
        return jsonpath + "[" + al[1] + "]"
      else
        console.log("unknown aspect_loc-t, for jsonpath", al)
      return jsonpath
    }, ""
  )
}

export function remove_entry_loc(aspect_loc) {
  return ld.tail(aspect_loc)
}

export function check_condition_value(condition_value, condition) {
  // console.log("check_condition_value", condition_value, condition)
  // debugger
  if (!condition_value && condition.value !== null)
    if (condition.default_pass !== undefined)
      return condition.default_pass
    else
      return false
  else {
    condition_value = unpack(condition_value)
  }
  //console.log("COND", condition_value, condition, typeof condition_value)
  // TODO dont parse to String but do proper comparison depending on aspect
  const compare = condition.compare || "equal"
  switch (compare) {
    case "equal":
      return condition_value === String(condition.value)
    case "unequal":
      // console.log("unequal", condition_value !== condition.value, condition_value !== String(condition.value))
      return condition_value !== condition.value
    case "contains":
      // this is more robust then the native indexof (and looks better) cuz lists are initially `null`
      // console.log("includes...", condition.value, condition_value,
      // there is also the motivation for the inverted case? check if the
      // console.log("contains", condition.value, condition_value)
      // console.log("contains,", condition_value, condition.value,)
      if (Array.isArray(condition_value)) {
        // console.log(ld.some(condition_value, val => ld.includes(condition.value, val)))
        return ld.some(condition_value, val => ld.includes(condition.value, val))
      }
      // console.log("contains",condition.value, condition_value, ld.includes(condition.value, condition_value))
      return ld.includes(condition.value, condition_value) //condition_value.includes(condition.value)
    default:
      console.log(`condition compare value invalid: ${compare}. Gonna use 'equal'`)
      return condition_value === String(condition.value)
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

export function complete_aspect_loc(uuid = null, no_entry_aspect_loc, index = null) {
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
  if (uuid) {
    return ld.concat([[ENTRY, uuid]], no_entry_aspect_loc)
  } else {
    return ld.concat([[EDIT, ""]], no_entry_aspect_loc)
  }
}


export function aspect_loc_uuid(aspect_loc) {
  return aspect_loc[0][1]
}

export function disabled_by_condition(store, aspect, aspect_loc, item_index, root_data) {
  // todo this doesnt work anymore always?
  if (ld.get(aspect, "attr.condition")) {

    let condition_value = null
    if (root_data) {
      condition_value = recursive_unpack2(select_aspect_loc(null, aspect_loc_str2arr(aspect.attr.condition.aspect), false, root_data))
    } else {
      let aspect_location = complete_aspect_loc(
        aspect_loc_uuid(aspect_loc),
        aspect_loc_str2arr(aspect.attr.condition.aspect),
        item_index) // todo index missing
      condition_value = store.getters["entries/value"](aspect_location)
    }

    return !check_condition_value(condition_value, aspect.attr.condition)
  } else {
    return false
  }
}

export function first_edit_loc(store) {
  return [[EDIT, store.getters["entries/get_edit"]().uuid]]
}

export function last_loc_value(aspect_loc) {
  return aspect_loc[aspect_loc.length - 1][1]
}

export function aspect_loc2aspect_descr_loc(aspect_loc) {
  return aspect_loc.map(loc => loc.length > 2 ? loc[2] : loc[1])
}

export function extract_n_unpack_values(aspects) {
  const values = {}
  if (typeof aspects === "object") {
    if (aspects.constructor === Array) {
      for (let aspect of aspects) {
        values[aspect.name] = unpack(aspect.value)
      }
    } else {
      for (let aspect of Object.entries(aspects)) {
        // entries: 0: name, 1: aspect-data
        values[aspect[0]] = unpack(aspect[1])
      }
    }
  }
  return values
}


export function aspectBuilder(type, name, label = name, attr = {}) {
  return {
    name,
    type,
    attr,
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

export function value_text(aspect, raw_value) {
  const shorten_array = (arr_val) => {
    if (arr_val.length > 5) {
      return ld.slice(arr_val, 0, 5).join(", ") + "..."
    } else {
      return arr_val.join(", ")
    }
  }

  const text_or_value = (value) => {
    return ld.get(aspect.items.find(i => i.value === value), "text", value)
  }

  switch (aspect.type) {
    case SELECT:
      return text_or_value(aspect, raw_value)
    case MULTISELECT:
    case TREEMULTISELECT: {
      return shorten_array(raw_value.map(v => text_or_value(v)))
    }
    case OPTIONS: {
      if (Array.isArray(raw_value)) {
        return shorten_array(raw_value)
      } else {
        // todo could be more checks here...
        return raw_value
      }
    }
    default:
      return raw_value
  }
}

export function set_default_values(aspects) {
  for (let aspect of aspects) {
    aspect.value = aspect_default_value(aspect)
  }
}

export function get_aspect_by_name(aspects, aspect_name) {
  return ld.find(aspects, a => a.name === aspect_name)
}

export function set_value_and_error(aspect, value = null, error = true) {
  aspect.value = pack_value(value),
    aspect.error = error
}
