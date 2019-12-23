import {
  aspect_loc_str2arr,
  aspect_loc_uuid,
  check_condition_value,
  complete_aspect_loc,
  delim2str
} from "../../lib/aspect";
import {ENTRIES_VALUE} from "../../lib/store_consts";
import {get_codes_as_options, no_duplicate_texts, object_list2options, string_list2options} from "../../lib/options";

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
        this.options = get_codes_as_options(this.$store, this.aspect.items)

        // TODO make this a function. str check is reference str begining. however here that should be either
        // clear or not checked like that...
      } else if (Array.from(Object.keys(delim2str)).includes(this.aspect.items[0])) {
        // getting the options from a value (type: list)
        let aspect_location = complete_aspect_loc(aspect_loc_uuid(this.aspect_loc),aspect_loc_str2arr(this.aspect.items))
        // console.log("referenced items...:", aspect_location)
        let value = this.$store.getters[ENTRIES_VALUE](aspect_location).value
        //console.log("building options from val", value)
        if(this.aspect.attr.entry_select && this.aspect.attr.filter_entries){
          console.log("entry-select", value)
          value = this.$_.filter(value, item => {
            const aspect_location = complete_aspect_loc(item.value, aspect_loc_str2arr(this.aspect.attr.filter_entries.aspect))
            console.log(this.$store.getters[ENTRIES_VALUE](aspect_location))
            const a_value = this.$store.getters[ENTRIES_VALUE](aspect_location).value
            console.log(aspect_location, a_value)
            return check_condition_value(a_value, this.aspect.attr.filter_entries)
          })
          console.log("filtered entries", value)
        }
        this.options = object_list2options(value, "value", "value")
        no_duplicate_texts(this.options)
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
