// this should be used for both Select, multi-select and treeselect

import {get_codes_as_tree} from "~/lib/options"

export default {
  name: "GeneralSelectMixin",
  props: {},
  computed: {
    data_source() {
      if (typeof this.aspect.items === "string") {
        return this.aspect.items.substring(1)
      }
    }
  }
}
