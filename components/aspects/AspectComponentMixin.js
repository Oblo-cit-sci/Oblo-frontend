import {EDIT, REVIEW, VIEW} from "~/lib/consts";
import {aspect_default_value, aspect_loc_uuid, aspect_raw_default_value, pack_value} from "~/lib/aspect";
import {mapGetters} from "vuex"
import AspectBaseMixin from "~/components/aspect_utils/AspectBaseMixin";

export default {
  name: "AspectComponentMixin",
  mixins: [AspectBaseMixin],
  props: {
    mvalue: {
      type: [Object, String, Number, Array, Boolean, null],
      required: true
    },
    aspect: {
      type: Object,
      required: true
    },
    mode: { // todo well, this is gonna be messy
      type: String,
      default: VIEW,
      validator: (value) => {
        return [VIEW, EDIT, REVIEW].includes(value)
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    aspect_loc: { // when not passed on, it is some kind of anonymous aspect, probably defined on that page (e.g. register)
      type: Array, // for composites and lists pass it down...
    },
    conditionals: {
      type: [Array, Object]
    },
    extra: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  computed: {
    ...mapGetters({"is_admin": "user/is_admin"}),

    value: {
      get: function () {
        return this.mvalue.value
      },
      set: function (val) {
        this.update_value(val)
      }
    },
    clearIcon() {
      //console.log("AspMix - ", this.aspect.name, this.aspect.type, this.extra)
      return ((this.extra.listitem && this.mode === EDIT) || false) ? "mdi-close" : undefined //this.extra
    },
    // todo not used atm. also clarify where extra should be, aspect. or aspect.extra
    rules() {
      if (this.$_.get(this.attr, "extra.rules")) {
        return this.attr.extra.rules
      }
    },
    is_required() {
      return this.$_.get(this.aspect, "attr.required", true)
    },
    hint() {
      return this.$_.get(this.attr, "extra.hint", null)
    },
    hide_details() {
      return !this.hint && !this.$_.get(this.attr, "extra.rules", null)
    },
    is_edit_mode() {
      return this.mode === EDIT
    },
    is_review_mode() {
      return this.mode === REVIEW
    },
    is_editable_mode() {
      return [EDIT, REVIEW].includes(this.mode)
    },
    is_view_mode() {
      return this.mode === VIEW
    },
    extras() {
      return Object.assign(Object.assign({}, this.extra), this.attr.extra)
    },
    is_set() {
      return (this.value === aspect_raw_default_value(this.aspect))
    }
  },
  methods: {
    update_value(value) {
      this.$emit("update_value", pack_value(value))
    },
    update_mvalue(mvalue) {
      mvalue.is_mvalue = true
      if (this.attr.update_raw) {
        mvalue = mvalue.value
      }
      this.$emit("update_value", mvalue)
    },
    update_error(has_error) {
      this.$emit("has_error", has_error)
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
        return this.$store.getters["entries/get_entry"](entry_uuid)
      } else {
        return null
      }
    },
    reset_value() {
      this.update_value(aspect_raw_default_value(this.aspect))
    },
    raw_default_value() {
      return aspect_raw_default_value(this.aspect)
    },
    raw_aspect_default_value(aspect) {
      return aspect_raw_default_value(aspect)
    },
    aspect_default_value(aspect) {
      return aspect_default_value(aspect)
    }
  },
}
