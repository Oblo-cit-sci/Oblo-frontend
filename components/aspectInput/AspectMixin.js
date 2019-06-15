/*
TODO fucking IMPORT BREAKS EVERYTHING
//import {aspect_default_value} from "../../lib/entry";
 */

import {VIEW} from "../../lib/consts";

// this must be a copy of entry.js
export function aspect_default_value(aspect) {
  //console.log("aspect_default_value", aspect.name, aspect)
  if (aspect.type.startsWith("!")) {
    return aspect.default
  }
  switch (aspect.type) {
    case "str":
      return ""
    case "int":
      // todo could also check attr.min
      return 0
    case "float":
      return 0
    case "@user":
      return null
    case "date":
      // TODO now?
      return new Date()
    case "gps":
      return null
    case "list":
      return []
    case "map":
      return []
    case "tree":
      return null
    case "composite":
      return ld.map(aspect.components, (c) => aspect_wrapped_default_value(c))
    case "options":
      return aspect_wrapped_default_value(aspect.options[0])
    case "select":
      return null
    case "multiselect":
      return null
    default:
      console.log("Warning trying to ge default value of aspect of unknown type", aspect)
      return null
  }
}

export function aspect_wrapped_default_value(aspect) {
  return {value: aspect_default_value(aspect)}
}


export default {
  props: {
    aspect: Object,
    value: {},
    // simplification of mode
    edit: {
      type: Boolean,
      default: true
    },
    mode: { // todo well, this is gonna be messy
      type: String,
      default: VIEW
    },
    disabled: {
      type: Boolean,
      default: false
    },
    extra: Object,
    hide: Array// todo implement
  },
  data() {
    return {
      i_value: null,
    }
  },
  created() {
    this.i_value = this.value;
  },
  methods: {
    title_description() {
      if (!this.aspect.hasOwnProperty("name")) {
        //console.log("warning: aspect", this.aspect, "has no name")
      }
      if (!this.aspect.hasOwnProperty("description")) {
        //console.log("warning: aspect", this.aspect, "has no description")
      }
      return {
        title: this.aspect.name || "",
        description: this.aspect.description || ""
      }
    },
    value_change(event) {
      //console.log("asp mix val change", this.aspect, event)
      this.$emit('update:value', event);
    }
  },
  computed: {
    readOnly() {
      return this.mode === VIEW
    }
  },
  watch: {
    value(new_val) {
      //console.log("asp mix update", this.aspect, new_val)
      this.i_value = new_val;
    },
    disabled() {
      this.i_value = aspect_default_value(this.aspect)
    }
  }
}

