import {EDIT, VIEW} from "../../lib/consts";
import {aspect_loc_uuid, aspect_raw_default_value} from "../../lib/aspect";

export default {
  props: {
    aspect: {
      type: Object,
      required: true
    },
    mode: { // todo well, this is gonna be messy
      type: String,
      default: VIEW
    },
    mvalue: {
      type: Object
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
    return {}
  },
  created() {
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
    },
    value() {
      return this.mvalue.value
    },
    entry_uuid() {
      return aspect_loc_uuid(this.aspect_loc)
    }

  },
  watch: {}
}

