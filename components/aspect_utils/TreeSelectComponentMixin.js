import {flatten_tree_to_options} from "~/lib/options";
import OptionsMixin from "~/components/aspect_utils/OptionsMixin";

export default {
  // todo maybe mixin: AspectComponentMixin
  name: "TreeSelectComponentMixin",
  mixins: [OptionsMixin],
  props: {},
  data() {
    return {
      "tree": {}
    }
  },
  methods: {
    calc_options() {
      // build the given_options (all tree available) from what is passed
      // let passed_tree = this.aspect.items;
      if (typeof this.aspect.items === "string") {
        this.tree = this.get_codes_as_options(this.aspect.items)
        // todo SELECT_MIXIN!!
        this.from_code_entry = true
        const match = this.check_language_match(this.aspect.items)
        this.code_entry_language_match = match[0]
        this.code_entry_language = match[2]
        //
      } else {
        this.tree = this.aspect.items
      }
      // console.log(this.tree, options.include_levels)
      // console.log(this.flat_options[0].parents)
    },
    get_flat_options(options) {
      return flatten_tree_to_options(this.tree, options)
    }
  }
}

