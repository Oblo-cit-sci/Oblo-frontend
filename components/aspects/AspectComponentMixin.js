import {EDIT, VIEW} from "~/lib/consts";
import {aspect_loc_uuid, aspect_raw_default_value, disabled_by_condition} from "~/lib/aspect";
import {ENTRIES_GET_ENTRY} from "~/store/entries";

export default {
  name: "AspectComponentMixin",
  props: {
    mvalue: {
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
    }
  },
  computed: {
    value() {
      if (this.is_unpacked) {
        return this.mvalue
      } else {
        return this.mvalue.value
      }
    },
    is_unpacked() {
      return this.$_.get(this.aspect, "attr.unpacked", false)
    },
    readOnly() {
      return this.mode === VIEW
    },
    clearIcon() {
      //console.log("AspMix - ", this.aspect.name, this.aspect.type, this.extra)
      return ((this.extra.listitem && this.mode === EDIT) || false) ? "mdi-close" : undefined //this.extra
    },
    // todo not used atm. also clarify where extra should be, aspect. or aspect.extra
    rules() {
      if (this.$_.get(this.aspect.attr, "extra.rules")) {
        if (this.hasOwnProperty("hideDetails")) {
          this.hideDetails = false
        }
        return this.aspect.attr.extra.rules
      }
    },
    is_required() {
      if (this.aspect.attr.hasOwnProperty("required")) {
        return aspect.attr.required
      } else
        return true
    },
    hint() {
      return this.$_.get(this.aspect.attr, "extra.hint", null)
    },
    hide_details() {
      return !this.hint && !this.$_.get(this.aspect.attr, "extra.rules", null)
    },
    is_edit_mode() {
      return this.mode === EDIT
    },
    is_view_mode() {
      return this.mode === VIEW
    },
    extras() {
      return Object.assign(Object.assign({}, this.extra), this.aspect.attr.extra)
    },
    is_set() {
      return (this.value === aspect_raw_default_value(this.aspect))
    }
  },
  methods: {
    update_value(value) {
      this.$emit("update_value", value)
    },
    entry_uuid() {
      if (this.aspect_loc) {
        return aspect_loc_uuid(this.aspect_loc)
      } else
        return null
    },
    get_entry() {
      const entry_uuid = this.entry_uuid()
      if (entry_uuid) {
        return this.$store.getters[ENTRIES_GET_ENTRY](entry_uuid)
      } else {
        return null
      }
    }
  },
}
