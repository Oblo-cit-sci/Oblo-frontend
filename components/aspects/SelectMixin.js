import {aspect_loc_str2arr, aspect_loc_uuid, check_condition_value, complete_aspect_loc, delim2str} from "~/lib/aspect";
import {
  no_duplicate_texts,
  object_list2options,
  transform_options_list
} from "~/lib/options";
import OptionsMixin from "~/components/aspect_utils/OptionsMixin";

export default {
  mixins: [OptionsMixin],
  props: {
    clearable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      selection: null,
      options: [],
      code: null, // if not null: {name, version}
      select_check: false, // attr.select = "check"
      check_box_value: null,
      //
      from_code_entry: false,
      code_entry_language_match: true,
      code_entry_language: ""
    }
  },
  created() {
    if (typeof this.aspect.items === "string") {
      // if (typeof this.aspect.items === "string") {
      this.options = this.get_codes_as_options(this.aspect.items)
      this.from_code_entry = true
      const match = this.check_language_match(this.aspect.items)
      this.code_entry_language_match = match[0]
      this.code_entry_language = match[2]
      // TODO make this a function. str check is reference str begining. however here that should be either
      // clear or not checked like that...
    }
      // else if (Array.from(Object.keys(delim2str)).includes(this.aspect.items[0])) {
      //   // getting the options from a value (type: list)
      //   let aspect_location = complete_aspect_loc(aspect_loc_uuid(this.aspect_loc), aspect_loc_str2arr(this.aspect.items))
      //   // console.log("referenced items...:", aspect_location)
      //   let value = this.$store.getters["entries/value"](aspect_location).value
      //   //console.log("building options from val", value)
      //   if (this.attr.entry_select && this.attr.filter_entries) {
      //     console.log("entry-select", value)
      //     value = this.$_.filter(value, item => {
      //       const aspect_location = complete_aspect_loc(item.value, aspect_loc_str2arr(this.attr.filter_entries.aspect))
      //       console.log(this.$store.getters["entries/value"](aspect_location))
      //       const a_value = this.$store.getters["entries/value"](aspect_location).value
      //       console.log(aspect_location, a_value)
      //       return check_condition_value(a_value, this.attr.filter_entries)
      //     })
      //     console.log("filtered entries", value)
      //   }
      //   this.options = object_list2options(value, "value", "value")
      //   no_duplicate_texts(this.options)
    // }}
    else if (this.aspect.items instanceof Array) {
      if (this.attr.hasOwnProperty("select") && this.attr.select === "check") {
        this.select_check = true
      }
      this.options = transform_options_list(this.aspect.items)
    } else {
      console.log("ERROR cannot create options from aspect items", this.aspect.items)
    }
  },
  computed: {
    attr() {
      return this.$_.get(this.aspect, "attr", {})
    }
  }
}
