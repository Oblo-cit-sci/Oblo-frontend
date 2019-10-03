import {
  aspect_loc_uuid,
  complete_aspect_loc,
  get_codes_as_options, object_list2options,
  string_list2options
} from "../../lib/client"
import {aspect_loc_str2arr, delim2str} from "../../lib/aspect";
import {ENTRIES_VALUE} from "../../lib/store_consts";

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
      } else if (Array.from(Object.keys(delim2str)).includes(this.aspect.items[0])) {
        // getting the options from a value (type: list)
        let aspect_location = complete_aspect_loc(aspect_loc_uuid(this.aspect_loc),aspect_loc_str2arr(this.aspect.items))
        let value = this.$store.getters[ENTRIES_VALUE](aspect_location).value
        //console.log("building options from val", value)
        this.options = object_list2options(value, "value", "value")
        //console.log(this.options)
      }
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
