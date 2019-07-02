

import {VIEW} from "../../lib/consts";
import {aspect_default_value} from "../../lib/entry";

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
    extra: {
      type: Object,
      default: () => {
        return {}
      }
    },
    hide: Array// todo implement
  },
  data() {
    return {
      i_value: null,
      aspect_ref: null,
      aspect_ref2: null,
    }
  },
  created() {
    //console.log("ASP Mix create", this.value)
    this.i_value = this.value

    try {
      //console.log(this.aspect.type, "new asp-mxn with", this.extra.aspect_ref, "adding", this.aspect.name)
      this.aspect_ref = (this.extra.aspect_ref || "") + "." + this.aspect.name
      this.aspect_ref2 = this.$_.concat(this.$_.cloneDeep(this.extra.aspect_ref || []), ["aspect", this.aspect.name])

      //console.log("setting ref", this.aspect.name, this.aspect.type, this.aspect_ref, ">", this.extra.aspect_ref)
    } catch (e) {
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
    },
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
      //console.log("val change", new_val)
      this.i_value = new_val;
    },
    disabled() {
      this.i_value = aspect_default_value(this.aspect)
    }
  }
}

