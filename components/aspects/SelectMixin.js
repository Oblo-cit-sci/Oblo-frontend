import {
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
    } else if (this.aspect.items instanceof Array) {
      if (this.attr.hasOwnProperty("select") && this.attr.select === "check") {
        this.select_check = true
      }
      this.options = transform_options_list(this.aspect.items)
    } else {
      console.log(this.aspect.name)
      console.log("ERROR cannot create options from aspect items", this.aspect.items)
    }
  },
  computed: {
    attr() {
      return this.$_.get(this.aspect, "attr", {})
    },
  },
  watch: {
    "aspect.items": function (items) {
      // console.log("deep watch items", items)
      if (items instanceof Array) {
        if (this.attr.hasOwnProperty("select") && this.attr.select === "check") {
          this.select_check = true
        }
        this.options = transform_options_list(items)
      }
    }
  }
}
