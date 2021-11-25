import {
  transform_options_list
} from "~/lib/options";
import OptionsMixin from "~/components/aspect_utils/OptionsMixin";
import {TREE} from "~/lib/consts";

const {JSONPath} = require('jsonpath-plus');

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
      // currently if, items is a object with source. but could also be with filters on items...
      has_computed_options: false,
      select_check: false, // attr.select = "check"
      check_box_value: null,
      //
      from_code_entry: false,
      code_entry_language_match: true,
      code_entry_language: ""
    }
  },
  created() {
    // tree generate a 'tree', which is used instead
    if (this.aspect.type !== TREE) {
      this.calculate_list_options()
    }
  },
  methods: {
    clean_item(item) {
      const {value, text, icon} = item
      const obj = {value, text, icon}
      const clean = {}
      for (let k_v of Object.entries(obj)) {
        const [k, v] = k_v
        if (v !== undefined) {
          clean[k] = v
        }
      }
      return clean
    },
    calculate_list_options() {
      if (typeof this.aspect.items === "string") {
        // if (typeof this.aspect.items === "string") {
        this.options = this.get_codes_as_options(this.aspect.items)
        // console.log("options from code-entry")
        this.from_code_entry = true
        // const match = this.check_language_match(this.aspect.items)
        // this.code_entry_language_match = match[0]
        // this.code_entry_language = match[2]
        // TODO make this a function. str check is reference str begining. however here that should be either
        // clear or not checked like that...
      } else if (Array.isArray(this.aspect.items)) {
        if (this.attr.hasOwnProperty("select") && this.attr.select === "check") {
          this.select_check = true
        }
        this.options = transform_options_list(this.aspect.items)
      } else if (this.aspect.items instanceof Object) {
        const source = this.aspect.items.source
        if (!source) {
          console.warn("aspect.items of", this.aspect.name, "should include 'source'")
          this.has_computed_options = false // aspect is basically broken...
        } else {
          this.has_computed_options = true
        }
      } else {
        console.log(this.aspect.name)
        console.error("cannot create options from aspect items", this.aspect.items)
      }
    }
  },
  computed: {
    attr() {
      return this.$_.get(this.aspect, "attr", {})
    },
    data_source() {
      if (typeof this.aspect.items === "string") {
        return this.aspect.items
      }
    },
    computed_list_options() {
      if (this.has_computed_options) {
        if (this.aspect.items instanceof Object) {
          // source was already validated in calculate_list_options
          const source = this.aspect.items.source
          // console.log("source", source)
          // console.log("checking conditionals", this.conditionals)
          const value_list = JSONPath({
            path: source,
            json: this.conditionals,
          })
          // console.log("result", value_list)
          if (Array.isArray(value_list)) {
            return transform_options_list(value_list)
          } else {
            console.warn("items.source of", this.aspect.name, "doest result in a list, but:", value_list)
          }
        }
      }
      return this.options
    }
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
