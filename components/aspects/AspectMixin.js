import {ASP_DISABLED, ASP_SET, ASP_UNSET, EDIT, ENTRY, FLEX, LIST_INDEX, META, REVIEW, VIEW} from "~/lib/consts";
import {
  aspect_loc_str2arr,
  aspect_loc_uuid,
  aspect_raw_default_value,
  check_condition_value, loc_prepend,
  pack_value, unpack
} from "~/lib/aspect";
import {select_aspect_loc} from "~/lib/entry"
import {recursive_unpack2} from "~/lib/util";
import AspectConditionChecker from "~/components/aspect_utils/AspectConditionChecker";


export default {
  props: {
    aspect: {
      type: Object,
      required: true
    },
    ext_value: {
      type: Object,
      default: undefined
    },
    mode: {
      type: String,
      default: VIEW,
      validator: (value) => {
        return [VIEW, EDIT, REVIEW, FLEX].includes(value)
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
    },
    is_set: {
      type: Boolean
    }
  },
  mixins: [AspectConditionChecker],
  data() {
    return {
      original_value: null,
    }
  },
  created() {
    if (this.track_change) {
      this.original_value = this.$_.cloneDeep(this.value)
    }
  },
  methods: {
    // debounce to not to store contantly while typing
    update_value(mvalue) {
      // console.log(mvalue)
      // value could be "" or 0 in case of strings, numbers
      const value = mvalue.value === undefined ? null : mvalue.value
      const is_mvalue = mvalue.is_mvalue
      if (is_mvalue) {
        delete mvalue.is_mvalue
      }

      let up_value = mvalue
      // debugger
      if (!(this.is_meta || is_mvalue)) {
        // console.log("packing")
        up_value = pack_value(value)
      }
      if (mvalue.only_value) {
        up_value = value.value
      }
      // console.log("upval", up_value)
      if (this.aspect_loc) {
        this.$store.dispatch("entries/set_entry_value", {aspect_loc: this.aspect_loc, value: up_value})
        if (this.attr.cache) {
          this.$store.commit("add_cache", {
            template: this.get_entry().template.slug,
            aspect: this.aspect.name,
            mvalue: up_value
          })
        }
      } else {
        // console.log("aspect update.ext", up_value)
        this.$emit("update:ext_value", up_value)
      }
      if (this.attr.titleAspect) {
        this.$store.commit("entries/update_title", {title: up_value.value})
      }
    },
    toString(value) {
      return value || ""
    },
    get_entry() {
      return this.$store.getters["entries/get_entry"](this.entry_uuid)
    },
    refresh_original() {
      this.original_value = this.$_.cloneDeep(this.value)
      if (this.$refs.aspect_component.refresh_original) {
        this.$refs.aspect_component.refresh_original()
      }
    }
  },
  computed: {
    attr() {
      return this.$_.get(this.aspect, "attr", {})
    },
    track_change() {
      return this.attr.track_change || false
    },
    is_required() {
      return this.$_.get(this.attr, "required", true)
    },
    edit() {
      return this.mode === EDIT
    },
    is_editable_mode() {
      return [EDIT, REVIEW].includes(this.mode)
    },
    show_is_optional() {
      return !this.is_required && this.edit
    },
    disable() {
      // console.log("Aspect.disable?", this.aspect.name, this.condition_fail)
      return this.condition_fail || this.attr.disable || this.disabled
    },
    condition_fail() {
      return this._condition_fail(this.aspect, this.aspect_loc, this.mode, this.entry_uuid, this.conditionals)
    },
    has_value() {
      return this.mvalue !== undefined || false
    },
    readOnly() {
      return this.mode === VIEW
    },
    asp_state() {
      // console.log("asp-state", this.aspect.name, this.i_is_set, this.disable)
      if (this.i_is_set) {
        return ASP_SET
      } else if (this.disable) {
        return ASP_DISABLED
      } else {
        return ASP_UNSET
      }
      // ERROR?
    },
    mvalue() {
      if (!this.aspect_loc) {
        if (this.ext_value !== undefined) {
          return this.ext_value
        } else {
          const raw = aspect_raw_default_value(this.aspect)
          console.log("no aspect-loc and no ext_value using default value", raw)
          return {value: raw}
        }
      } else {
        // todo removed this legacy functionality
        // if (this.attr.IDAspect) {...
        // and...
        // if (this.attr.ref_value) {
        let value = this.$store.getters["entries/value"](this.aspect_loc)
        if (value === undefined) {
          // console.log("undefined, probably means update", this.aspect, this.extra)
          let raw__new_value = aspect_raw_default_value(this.aspect)

          this.update_value(raw__new_value)
          // if (this.is_unpacked)
          //   return raw__new_value
          // else
          return pack_value(raw__new_value)
        }
        if (this.is_meta) {
          return pack_value(value)
        }
        // console.log(this.aspect.name, this.aspect_loc, value)
        return value
      }
    },
    is_meta() {
      // maybe just for entries
      if (this.aspect_loc) {
        for (let a_v of this.aspect_loc) {
          if (a_v[0] === META) {
            return true
          }
        }
      }
      return false
    },
    value() {
      return unpack(this.mvalue)
    },
    entry_uuid() {
      if (!this.aspect_loc) {
        return null
      }
      return aspect_loc_uuid(this.aspect_loc)
    },
    i_is_set() {
      return this.value !== aspect_raw_default_value(this.aspect)
    },
    has_changed() {
      // console.log("aspmxn.has_changed", this.aspect.type, !this.$_.isEqual(this.value, this.original_value))
      //   this.value, this.original_value, !this.$_.isEqual(this.value,  this.original_value))
      return this.track_change && !this.$_.isEqual(this.value, this.original_value)
    }
  },
  watch: {
    asp_state: {
      immediate: true,
      handler(value) {
        this.$emit("update:state", value)
      }
    },
    // todo maybe use the default methods from AspectBaseMixin
    condition_fail(fail) {
      if (fail) {
        if (this.value !== aspect_raw_default_value(this.aspect)) {
          this.update_value({
            value: aspect_raw_default_value(this.aspect)
          })
        }
      }
    },
    has_changed(change) {
      // console.log("aspect_mxn.has_changed", this.aspect.name, this.aspect.type, change)
      this.$emit("has_changed", {name: this.aspect.name, change})
    }
  }
}

