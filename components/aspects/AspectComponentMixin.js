import {EDIT, VIEW} from "~/lib/consts";
import {ENTRIES_GET_ENTRY} from "~/lib/store_consts";
import {aspect_loc_uuid} from "~/lib/aspect";

export default {
  name: "AspectComponentMixin",
  props: {
    value: {
      required: true
    },
    aspect: {
      type: Object,
      required: true
    },
    mode: { // todo well, this is gonna be messy
      type: String,
      default: VIEW
    },
    disabled: {
      type: Boolean,
      default: false
    },
    aspect_loc: { // when not passed on, it is some kind of anonymous aspect, probably defined on that page (e.g. register)
      type: Array, // for composites and lists pass it down...
    },
    extra: {
      type: Object,
      default: () => {
        return {}
      }
    },
    rules: {
      type: Array,
      default: ()  => []
    }
  },
  computed: {
    readOnly() {
      return this.mode === VIEW
    },
    clearIcon() {
      //console.log("AspMix - ", this.aspect.name, this.aspect.type, this.extra)
      return ((this.extra.listitem && this.mode === EDIT) || false) ? "mdi-close" : undefined //this.extra
    },
  },
  methods: {
    update_value(value) {
      this.$emit("update_value", value)
    },
    entry_uuid() {
      if(this.aspect_loc) {
        return aspect_loc_uuid(this.aspect_loc)
      } else
        return null
    },
    get_entry() {
      const entry_uuid = this.entry_uuid()
      if(entry_uuid){
        return this.$store.getters[ENTRIES_GET_ENTRY](this.entry_uuid)
      } else {
        return null
      }
    }
  }
}
