import {EDIT, LIST_INDEX, REGULAR, VIEW} from "../../lib/consts";
import {
  aspect_default_value,
  aspect_loc_str2arr,
  aspect_loc_uuid,
  aspect_raw_default_value, check_condition_value,
  complete_aspect_loc, pack_value
} from "../../lib/aspect";
import {ENTRIES_GET_ENTRY, ENTRIES_SET_ENTRY_VALUE, ENTRIES_VALUE} from "../../lib/store_consts";

export default {
  props: {
    aspect: {
      type: Object,
      required: true
    },
    ext_value: {
      type: Object
    },
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
    return {}
  },
  created() {
  },
  methods: {
    value_change(event, regular = this.use_regular) {
      if (event === undefined)
        event = null
      this.update_value(event, regular)
    },
    update_value(raw_value, regular = true) {
      //console.log("saving", eveventent, this.aspect.name)
      if (this.has_alternative && regular) {
        if (this.aspect.attr.hasOwnProperty("alternative-activate-on-value")) {
          if (raw_value === this.aspect.attr["alternative-activate-on-value"]) {
            console.log("weird stop in aspect...")
            return
          }
        }
      }
      let up_value = pack_value(raw_value)
      if (!regular) {
        up_value.regular = false
      }
      if (this.aspect_loc)
        this.$store.dispatch(ENTRIES_SET_ENTRY_VALUE, {aspect_loc: this.aspect_loc, value: up_value})
      else
        this.$emit("update_value", up_value)
    },
    toString(value) {
      return value || ""
    },
    get_entry() {
      return this.$store.getters[ENTRIES_GET_ENTRY](this.entry_uuid)
    }
  },
  computed: {
    edit() {
      return this.mode === EDIT
    },
    condition_fail() {
      //console.log("condition_fail?", this.aspect, this.aspect.name, this.condition)
      // todo this getting of the value, could mayeb also go into the helper...
      if (this.aspect.attr.hasOwnProperty("condition")) {
        //console.log("condition", this.aspect.name, this.extra[LIST_INDEX])
        let aspect_location = complete_aspect_loc(
          aspect_loc_uuid(this.aspect_loc),
          aspect_loc_str2arr(this.aspect.attr.condition.aspect),
          this.extra[LIST_INDEX])
        //console.log("val", aspect_location)
        let condition_value = this.$store.getters[ENTRIES_VALUE](aspect_location)
        return !check_condition_value(condition_value, this.aspect.attr.condition)
      } else {
        return false
      }
    },
    has_value() {
      return this.mvalue || false
    },
    has_alternative() {
      return this.aspect.attr.hasOwnProperty("alternative")
    },
    readOnly() {
      return this.mode === VIEW
    },
    clearIcon() {
      //console.log("AspMix - ", this.aspect.name, this.aspect.type, this.extra)
      return ((this.extra.listitem && this.mode === EDIT) || false) ? "clear" : undefined //this.extra
    },
    alternative() {
      return this.aspect.attr.alternative
    },
    use_regular: {
      get() {
        return this.mvalue.hasOwnProperty("regular") ? this.mvalue.regular : true
      },
      set(value, old_value) {
        if (value) {
          this.update_value(aspect_raw_default_value(this.aspect))
        } else {
          this.update_value(aspect_raw_default_value(this.alternative), false)
        }
      }
    },
    value() {
      return this.mvalue.value
    },
    mvalue: function () {
      if(!this.aspect_loc) {
        if(this.ext_value) {
          return this.ext_value
        } else {
          return {value:null}
        }
      }
      //console.log(this.aspect.name)
      if (this.aspect.attr.IDAspect) {
        let this_uuid = aspect_loc_uuid(this.aspect_loc)
        let entry = this.$store.getters[ENTRIES_GET_ENTRY](this_uuid)
        let index = this.$_.last(entry.refs.parent.aspect_loc)[1]
        return {value: index + 1}
      }
      if (this.aspect.attr.ref_value) {
        //console.log("ref")
        // GRAB REF
        let aspect_location = complete_aspect_loc(
          aspect_loc_uuid(this.aspect_loc),
          aspect_loc_str2arr(this.aspect.attr.ref_value),
          this.extra[LIST_INDEX])
        // console.log("value ref,  ",this.aspect.name, aspect_location)
        let ref_value = this.$store.getters[ENTRIES_VALUE](aspect_location)
        //console.log("ref value", ref_value)
        if (ref_value === undefined) {
          console.log("broken ref!")
          ref_value = pack_value(this.raw_default_value())
        }

        if (ref_value.hasOwnProperty(REGULAR)) {
          delete ref_value[REGULAR]
        }

        if (this.aspect.attr.ref_update === "create") {
          debugger
          //console.log("ref-create", this.aspect_loc)
          let stored_value = this.$store.getters[ENTRIES_VALUE](this.aspect_loc)
          //console.log("stored", stored_value)
          if (this.$_.isEqual(stored_value, aspect_default_value(this.aspect))) {
            //console.log("ref-create:updating")
            this.update_value(ref_value.value)
            return ref_value
          } else {
            return stored_value
          }
        } else {
          //console.log("updating")
          //this.update_value(ref_value.value)
          //return ref_value
        }
      } else if (this.aspect.attr.ref_length) { // this is for lists
        let location_array = complete_aspect_loc(aspect_loc_uuid(this.aspect_loc), aspect_loc_str2arr(this.aspect.attr.ref_length))

        // USES lists or ints
        const length_value = this.$store.getters[ENTRIES_VALUE](location_array).value
        // todo use the aspect_descr to find out if its a list or an int
        if (Array.isArray(length_value)) {
          this.extra["ref_length"] = length_value.length
        } else {
          this.extra["ref_length"] = parseInt(length_value)
        }

        return this.$store.getters[ENTRIES_VALUE](this.aspect_loc)
      } else {
        let value = this.$store.getters[ENTRIES_VALUE](this.aspect_loc)
        if (value === undefined) {
          console.log("undefined", this.aspect)
          let raw__new_value = aspect_raw_default_value(this.aspect)
          this.update_value(raw__new_value)
          return pack_value(raw__new_value)
        }
        return value
      }
    },
    entry_uuid() {
      return aspect_loc_uuid(this.aspect_loc)
    }
  },
  watch: {}
}

