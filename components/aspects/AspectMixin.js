import {EDIT, VIEW} from "../../lib/consts";
import {aspect_raw_default_value} from "../../lib/aspect";

export default {
  props: {
    aspect: {
      type: Object,
      required: true
    },
    value: {},
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
    },
    extra: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      i_value: this.value,
    }
  },
  created() {
    //console.log("ASP Mix create", this.value)
    this.i_value = this.value
  },
  methods: {
    value_change(event) {
      this.$emit('update_value', event);
    },
    toString(value) {
      return value || ""
    },
  },
  computed: {
    edit() {
      return this.mode === EDIT
    },
    readOnly() {
      return this.mode === VIEW
    },
    clearIcon() {
      //console.log("AspMix - ", this.aspect.name, this.aspect.type, this.extra)
      return ((this.extra.listitem && this.mode === EDIT) || false) ? "clear" : undefined //this.extra
    }
  },
  watch: {
    value(new_val) {
      //console.log("asp mix watch value", new_val)
      this.i_value = new_val;
    },
    disabled() {
      this.i_value = aspect_raw_default_value(this.aspect)
    }
  }
}
