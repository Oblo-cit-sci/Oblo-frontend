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
      return null
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
    extra: {
      type: Object,
      default: new Object()
    },
    hide: Array// todo implement
  },
  data() {
    return {
      i_value: null,
      aspect_ref: null,
      aspect_ref2: null
    }
  },
  created() {
    this.i_value = this.value

    try {
      //console.log(this.aspect.type, "new asp-mxn with", this.extra.aspect_ref, "adding", this.aspect.name)
      this.aspect_ref = (this.extra.aspect_ref || "") + "." + this.aspect.name
      this.aspect_ref2 = this.$_.concat(this.$_.cloneDeep(this.extra.aspect_ref || []), ["aspect",this.aspect.name])

      //console.log("setting ref", this.aspect.name, this.aspect.type, this.aspect_ref, ">", this.extra.aspect_ref)
    } catch(e) {
      console.log("asp mixin debug, aspect passed", this.aspect)
    }
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
    },
    clearIcon() {
      console.log("AspMix - ", this.aspect.name, this.aspect.type, this.extra)
      return (this.extra.listitem || false) ? "clear" : undefined //this.extra
    }
  },
  watch: {
    value(new_val) {
      //console.log("val change", new_val)
      this.i_value = new_val;
    },
    disabled() {
      this.i_value = aspect_default_value(this.aspect)
    }
  }
}

