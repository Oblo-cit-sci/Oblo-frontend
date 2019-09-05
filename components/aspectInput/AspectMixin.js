

import {ASPECTACTION, TITLE_ASPECT, TITLE_UPDATE, VIEW} from "../../lib/consts";
import {aspect_raw_default_value} from "../../lib/entry";

export default {
  props: {
    aspect: {
      type: Object,
      required: true
    },
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
    aspect_loc: {
      type: Array, // for composites and lists pass it down...
      required: true
    },
    extra: {
      type: Object,
      default: () => {
        return {
          aspect_loc: []
        }
      }
    },
    hide: Array// todo implement
  },
  data() {
    return {
      i_value: null,
    }
  },
  created() {
    //console.log("ASP Mix create", this.value)
    this.i_value = this.value

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
      if(this.extra[TITLE_ASPECT]) {
        this.$emit(ASPECTACTION, {action: TITLE_UPDATE, value: this.toString(event)})
      }
    },
    toString(value) {
      return value || ""
    }
  },
  computed: {
    readOnly() {
      return this.mode === VIEW
    },
    clearIcon() {
      //console.log("AspMix - ", this.aspect.name, this.aspect.type, this.extra)
      return (this.extra.listitem || false) ? "clear" : undefined //this.extra
    }
  },
  watch: {
    value(new_val) {
      this.i_value = new_val;
    },
    disabled() {
      this.i_value = aspect_raw_default_value(this.aspect)
    }
  }
}

