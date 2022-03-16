import SimpleTextView from "~/components/aspect_utils/SimpleTextView"
import {
  ASPECT, AUDIO,
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
  FLOAT, GEOMETRY,
  IMAGES,
  INDEX,
  INT,
  LINKED_ENTRY_INDEX,
  LINKED_INDEX,
  LIST,
  LOCATION, MONTH,
  MULTISELECT,
  OPTIONS,
  PARENT, REVIEW,
  SELECT,
  SIMPLETEXTVIEW,
  STR,
  TREE, VALUE, VIDEO,
  VIEW
} from "./consts";
import StringAspect from "../components/aspects/StringAspect"
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
import ExternalAccountAspect from "~/components/aspects/ExternalAccountAspect";
import VideoAspect from "~/components/aspects/VideoAspect"
import MonthAspect from "~/components/aspects/MonthAspect"
import GeometryAspect from "~/components/aspects/GeometryAspect"

const ld = require("lodash")


/**
 * packs a value (wraps it into an object, with the raw value in the value property)
 * @param value
 * @returns {{value: null}}
 */
export function pack_value(value = null) {
  return {value: value}
}

/**
 * packs it normally but packs arrays properly.
 * Use this for Multiselect packing...
 */
export function pack_array_values(value = null) {
  if (Array.isArray(value)) {
    return pack_value(value.map(v => pack_array_values(v)))
  } else {
    return pack_value(value)
  }

}

/**
 * Unpacks a value (unwraps it from an object, with the raw value in the value property)
 * @param value
 * @returns {*}
 */
export function unpack(value) {
  // console.log(typeof value)
  if (typeof value === "object" && value !== null) {
    if (value.hasOwnProperty(VALUE)) {
      return value.value
    } else if (Array.isArray(value)) {
      return value
    } else {
      console.trace()
      console.error("Cannot unpack", value)
      return value
    }
  } else {
    return value
  }
}


/**
 * checks if a value is packed (an object with the raw value in the value property)
 * @param value
 * @returns {boolean}
 */
export function is_packed(value) {
  return (typeof value === "object" && value.hasOwnProperty(VALUE))
}

export function get_aspect_vue_component(aspect, mode = EDIT) {
  if (!aspect) {
    console.log("No Aspect!!")
    return BasicAspect
  }
  const aspect_attr = attr(aspect)
  if (mode === VIEW && aspect_attr[VIEW_COMPONENT]) {
    switch (attr.view_component) {
      case "url":
        return UrlView
    }
  } else if (is_editable_mode(mode) && aspect_attr.edit_component) {
    switch (aspect_attr.edit_component) {
      case "tag_options":
        return TagOptions
      case "new-grid-select":
        return SelectGrid2
    }
  }
  switch (aspect.type) {
    case STR:
      return StringAspect
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
    case VIDEO:
      return VideoAspect
    case MONTH:
      return MonthAspect
    case GEOMETRY:
      return GeometryAspect
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
  return aspect?.attr || {}
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

/**
 * Check if a value, is equal to the default value of its aspect-type
 * @param packed_value
 * @param aspect
 * @returns {boolean}
 */
export function isEqual_default_value(packed_value, aspect) {
  const default_value = aspect_default_value(aspect)
  if (aspect.type === OPTIONS) {
    if (packed_value.option) {
      const option_aspect = aspect.options.filter(o => o.name === packed_value.option)[0]
      return ld.isEqual(packed_value.value, aspect_default_value(option_aspect))
    } else {
      return ld.isEqual(packed_value, default_value)
    }
  } else {
    return ld.isEqual(packed_value, default_value)
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
    case AUDIO:
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
    case VIDEO:
    case GEOMETRY:
    case MONTH:
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
        // todo maybe use recursive unpack above so we dont need val.value
        return ld.some(condition_value, val => ld.includes(condition.value, val.value))
      }
      // console.log("contains",condition.value, condition_value, ld.includes(condition.value, condition_value))
      return ld.includes(condition.value, condition_value) //condition_value.includes(condition.value)
    default:
      console.log(`condition compare value invalid: ${compare}. Gonna use 'equal'`)
      return condition_value === String(condition.value)
  }
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
  aspect.value = pack_value(value)
  aspect.error = error
}

export function is_editable_mode(mode) {
  return [EDIT, REVIEW].includes(mode)
}


