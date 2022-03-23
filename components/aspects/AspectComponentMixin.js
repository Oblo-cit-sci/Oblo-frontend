import {EDIT, REVIEW, VIEW} from "~/lib/consts";
import {
  aspect_default_value,
  aspect_raw_default_value,
  is_editable_mode,
  pack_value
} from "~/lib/aspect";
import {mapGetters} from "vuex"
import AspectBaseMixin from "~/components/aspect_utils/AspectBaseMixin";

export default {
  name: "AspectComponentMixin",
  mixins: [AspectBaseMixin],
  props: {
    mvalue: {
      type: Object,
      required: true
    },
    aspect: {
      type: Object,
      required: true
    },
    mode: {
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
    entry_uuid: {
      type: String
    },
    conditionals: {
      type: [Array, Object]
    },
    extra: {
      type: Object,
      default: () => {
        return {}
      }
    },
    question_only: {
      type: Boolean,
    },
    change_status: {
      type: Boolean,
      default: false
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
      return ((this.extra.listitem && this.is_editable_mode) || false) ? "mdi-close" : undefined //this.extra
    },
    // // todo not used atm. also clarify where extra should be, aspect. or aspect.extra
    rules() {
      // crashes with null instead undefined
      return this.$_.get(this.attr, "extra.rules", undefined)
    },
    is_required() {
      return this.$_.get(this.attr, "required", true)
    },
    hint() {
      return this.$_.get(this.attr, "extra.hint", null)
    },
    hide_details() {
      // console.log("details?",!this.hint, !this.$_.get(this.attr, "extra.rules", null))
      return false //!this.hint && !this.$_.get(this.attr, "extra.rules", null)
    },
    is_edit_mode() {
      return this.mode === EDIT
    },
    is_review_mode() {
      return this.mode === REVIEW
    },
    is_editable_mode() {
      return is_editable_mode(this.mode)
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
    update_packed_value(mvalue) {
      this.$emit("update_value", mvalue)
    },
    update_error(has_error) {
      this.$emit("has_error", has_error)
    },
    get_entry() {
      if (this.entry_uuid) {
        return this.$store.getters["entries/get_entry"](this.entry_uuid)
      } else {
        return null
      }
    },
    reset_value() {
      this.update_value(aspect_raw_default_value(this.aspect))
    },
    raw_aspect_default_value(aspect) {
      return aspect_raw_default_value(aspect)
    },
    aspect_default_value(aspect) {
      return aspect_default_value(aspect)
    }
  },
}
