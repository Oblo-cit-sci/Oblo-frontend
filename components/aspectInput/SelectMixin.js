import {get_codes_as_options, string_list2options} from "../../lib/client"

export default {
  data() {
    return {
      selection: null,
      options: [],
      code: null, // if not null: {name, version}
      select_check: false, // attr.select = "check"
      check_box_value: null
    }
  },
  created() {
    if (typeof this.aspect.items === "string") {
      if (this.aspect.items.startsWith("*")) {
        this.options = get_codes_as_options(this.$store.state, this.aspect.items)
      }
      //console.log("options", this.options)
    } else if (this.aspect.items instanceof Array) {
      if (this.aspect.attr.hasOwnProperty("select") && this.aspect.attr.select === "check") {
        this.select_check = true
      }
      this.options = string_list2options(this.aspect.items)
    } else {
      console.log("ERROR cannot create options from aspect items", this.aspect.items)
    }
  }
}
