import {EDIT, ENTRY, FLEX, LIST_INDEX, META, REVIEW, VIEW} from "~/lib/consts";
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

var jp = require('jsonpath')

export default {
  props: {
    aspect: {
      type: Object,
      required: true
    },
    ext_value: {
      type: [Object, String, Number, Array, Boolean],
      default: undefined
    },
    mode: { // todo well, this is gonna be messy
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
    aspect_loc: { // when not passed on, it is somew kind of anonymous aspect, probably defined on that page (e.g. register)
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
  methods: {
    // debounce to not to store contantly while typing
    update_value({value, is_mvalue}) {
      // const is_mvalue = value.value && value.is_meta !== undefined
      // const mvalue = unpack(value) // thats why the is_mvalue unpacking is shit.
      // todo it should be fck with 2 params, value, is_meta = false
      // console.log("received update value", this.aspect.name, value, is_mvalue)
      if (value === undefined)
        value = null

      let up_value = value
      // debugger
      if (!(this.is_meta || is_mvalue)) {
        // console.log("packing")
        up_value = pack_value(value)
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
        this.$emit("update:ext_value", up_value)
      }

      if (this.attr.tag) {
        const tag = this.attr.tag
        // console.log("taggy")
        // console.log(this.attr.tag, up_value)
        // let val = jp.value(up_value, "$.value[0].value")
        // console.log("->", val)
        this.$store.commit("entries/add_tag", {name: tag.name, value: jp.value(up_value, tag.subpath)})
      }
    },
    toString(value) {
      return value || ""
    },
    get_entry() {
      return this.$store.getters["entries/get_entry"](this.entry_uuid)
    }
  },
  computed: {
    attr() {
      return this.$_.get(this.aspect, "attr", {})
    },
    edit() {
      return this.mode === EDIT
    },
    condition_fail() {
      // todo pass if edit
      // todo this getting of the value, could maybe also go into the helper...
      let condition_value = null
      if (this.attr.hasOwnProperty("condition")) {
        if (this.conditionals) {
          condition_value = recursive_unpack2(select_aspect_loc(null, aspect_loc_str2arr(this.attr.condition.aspect), false, this.conditionals))
        } else if (this.aspect_loc) {
          let aspect_location = loc_prepend(this.edit ? EDIT : ENTRY, this.entry_uuid,
            aspect_loc_str2arr(this.attr.condition.aspect))
          // console.log("checking condition for", this.aspect.name)
          // console.log("condition aspect-loc", aspect_location)
          condition_value = this.$store.getters["entries/value"](aspect_location)
        } else {
          console.log(`condition for aspect ${this.aspect.name} cannot be checked. no aspect_loc and no conditionals`)
          return false
        }
        return !check_condition_value(condition_value, this.attr.condition)
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
    mvalue() {
      if (!this.aspect_loc) {
        if (this.ext_value !== undefined) {
          return this.ext_value
        } else {
          const raw = aspect_raw_default_value(this.aspect)
          // console.log("raw", raw, this.is_unpacked)
          return {value: raw}
        }
      }
      // if (!this.aspect.hasOwnProperty("attr")) {
      //   console.log("AspectMixin.mvalue: broken Aspect, no ATTR:", this.aspect.name)
      //   return pack_value(aspect_raw_default_value(this.aspect))
      // }
      //console.log("value . ",this.aspect.name)
      if (this.attr.IDAspect) {
        let this_uuid = aspect_loc_uuid(this.aspect_loc)
        let entry = this.$store.getters["entries/get_entry"](this_uuid)
        let id = this.$_.last(entry.entry_refs.parent.aspect_loc)[1] + 1
        let stored_value = this.$store.getters["entries/value"](this.aspect_loc).value
        if (stored_value !== id) {
          this.update_value(id)
        }
        return {value: id}
      }
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
        let value = this.$store.getters["entries/value"](this.aspect_loc)
        if (value === undefined) {
          // console.log("undefined, probably means update", this.aspect, this.extra)
          this.new_in_update = true
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
        console.log(this.aspect.name, this.aspect_loc, value)
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
    }
  },
  watch: {
    condition_fail(fail) {
      if (fail) {
        if (this.value !== aspect_raw_default_value(this.aspect)) {
          this.update_value(aspect_raw_default_value(this.aspect))
        }
      }
    }
  }
}

