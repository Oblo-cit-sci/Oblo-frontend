import {ASP_DISABLED, ASP_SET, ASP_UNSET, EDIT, ENTRY, FLEX, LIST_INDEX, META, REVIEW, VIEW} from "~/lib/consts";
import {
  aspect_default_value,
  aspect_loc_str2arr,
  aspect_loc_uuid,
  aspect_raw_default_value,
  check_condition_value,
  complete_aspect_loc, loc_prepend,
  pack_value, unpack
} from "~/lib/aspect";
import {select_aspect_loc} from "~/lib/entry"
import {recursive_unpack2} from "~/lib/util";


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
    },
    check_recursive_condition(condition) {
      if (Array.isArray(condition)) {
        const method = condition[0].toLowerCase()
        if (condition.length < 2 || !["and", "or"].includes(method)) {
          console.log("Wrong condition format", condition)
        }
        const conditions = condition.slice(1)
        if (method === "and") {
          return conditions.every(conditions,c => this.check_recursive_condition(c))
        } else {
          return conditions.some(c => this.check_recursive_condition(c))
        }
      } else {
        return this.check_single_condition(condition)
      }
    },
    check_single_condition(condition) {
      let condition_value = null
      if (this.conditionals) {
        condition_value = recursive_unpack2(select_aspect_loc(null, aspect_loc_str2arr(condition.aspect), false, this.conditionals))
      } else if (this.aspect_loc) {
        let aspect_location = loc_prepend(this.edit ? EDIT : ENTRY, this.entry_uuid,
          aspect_loc_str2arr(condition.aspect))
        condition_value = this.$store.getters["entries/value"](aspect_location)
      } else {
        console.log(`condition for aspect ${this.aspect.name} cannot be checked. no aspect_loc and no conditionals`)
        return false
      }
      return check_condition_value(condition_value, condition)
    },
  },
  computed: {
    attr() {
      return this.$_.get(this.aspect, "attr", {})
    },
    track_change() {
      return this.attr.track_change || false
    },
    is_required() {
      return this.attr.required || true
    },
    edit() {
      return this.mode === EDIT
    },
    show_is_optional() {
      return !this.is_required && this.edit
    },
    disable() {
      // console.log("Aspect.disable?", this.aspect.name, this.condition_fail)
      return this.condition_fail || this.attr.disable || this.disabled
    },
    condition_fail() {
      if (this.attr.hasOwnProperty("condition")) {
        return !this.check_recursive_condition(this.attr.condition)
      } else {
        return false
      }
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
          return {value: raw}
        }
      }
      // if (!this.aspect.hasOwnProperty("attr")) {
      //   console.log("AspectMixin.mvalue: broken Aspect, no ATTR:", this.aspect.name)
      //   return pack_value(aspect_raw_default_value(this.aspect))
      // }
      //console.log("value . ",this.aspect.name)
      // if (this.attr.IDAspect) {
      //   let this_uuid = aspect_loc_uuid(this.aspect_loc)
      //   let entry = this.$store.getters["entries/get_entry"](this_uuid)
      //   let id = this.$_.last(entry.entry_refs.parent.aspect_loc)[1] + 1
      //   let stored_value = this.$store.getters["entries/value"](this.aspect_loc).value
      //   if (stored_value !== id) {
      //     this.update_value(id)
      //   }
      //   return {value: id}
      // }
      if (this.attr.ref_value) {
        //console.log("ref")
        // GRAB REF
        let aspect_location = complete_aspect_loc(
          aspect_loc_uuid(this.aspect_loc),
          aspect_loc_str2arr(this.attr.ref_value),
          this.extra[LIST_INDEX])
        // console.log("value ref,  ",this.aspect.name, aspect_location)
        let ref_value = this.$store.getters["entries/value"](aspect_location)
        //console.log("ref value", ref_value)
        if (ref_value === undefined) {
          console.log("broken ref!")
          ref_value = pack_value(aspect_raw_default_value(this.aspect))
        }

        let stored_value = this.$store.getters["entries/value"](this.aspect_loc)
        if (this.attr.ref_update === "create") {
          if (this.$_.isEqual(stored_value, aspect_default_value(this.aspect)) &&
            !this.$_.isEqual(stored_value, ref_value)) { // this will catch a inf loop when ref_value === default
            this.update_value(ref_value.value)
            return ref_value
          } else {
            return stored_value
          }
        } else {
          if (!this.$_.isEqual(stored_value, ref_value)) {
            this.update_value(ref_value.value)
          }
          return ref_value
        }
      } else if (this.attr.ref_length) { // this is for lists
        let location_array = complete_aspect_loc(aspect_loc_uuid(this.aspect_loc), aspect_loc_str2arr(this.attr.ref_length))
        // USES lists or ints
        const length_value = this.$store.getters["entries/value"](location_array).value

        // todo use the aspect_descr to find out if its a list or an int
        if (Array.isArray(length_value)) {
          this.extra["ref_length"] = length_value.length
        } else {
          this.extra["ref_length"] = parseInt(length_value)
        }
        return this.$store.getters["entries/value"](this.aspect_loc)
      } else {
        // console.log("getting value...", this.aspect_loc)
        // console.log(this.aspect.name, this.aspect_loc)
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

