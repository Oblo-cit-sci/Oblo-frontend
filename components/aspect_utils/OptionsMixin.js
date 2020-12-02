import {transform_options_list, tree_options_add_ids} from "~/lib/options"
import TagsMixin from "~/lib/TagsMixin"
import TreeMixin from "~/lib/TreeMixin"
import {mapGetters} from "vuex"

export default {
  name: "OptionsMixin",
  mixins: [TagsMixin, TreeMixin],
  props: {
    // items: {
    //   type: [String, Object, Array],
    //   required: true
    // }
  },
  computed: {
    ...mapGetters({get_code_entry: "templates/code"})
  },
  methods: {
    check_language_match(code_slug) {
      const language = this.$store.getters["user/settings"].domain_language
      const code_entry = this.$store.getters["templates/code"](code_slug, language)
      console.log(language, code_entry.language)
      return [language === code_entry.language, language, code_entry.language]
    },
    get_codes_as_options(code_slug) {
      const language = this.$store.getters["user/settings"].domain_language
      const code_entry = this.$store.getters["templates/code"](code_slug, language)
      if (code_entry) {
        if (code_entry.template.slug === "value_list") {
          return code_entry.values.list
        } else if (code_entry.template.slug === "value_tree") {
          const tree_ = this.$_.cloneDeep(code_entry.values)
          tree_options_add_ids(tree_)
          return tree_
        }
      } else {
        return []
      }
    },
    get_items(input, mode) {
      /**
       * returns an array of str || objects (each obj. must have "value")
       */
      // console.log("get_items", input, typeof input)
      if (typeof input === "string") {
        // console.log("get_items.input str")
        const code_entry = this.get_code_entry(input)
        if (!code_entry) {
          console.log("error, code entry with slug not found:", input)
          return []
        }
        return this.create_tags(code_entry)
      } else if (Array.isArray(input)) {
        // console.log("get_items.input array")
        input = this.resolve_items(input)
        return this.get_options(input)
      } else if (typeof input === "object") {
        return this.resolve_object(input).value
      } else {
        console.log("get items must have a string (code-entry_slug) or an array")
      }
    },
    resolve_items(input) {
      return input.map(i => {
        const type = typeof i
        if (type === "object") {
          if (i.value)
            return i
          else
            return this.resolve_object(i)
        } else if (type === "string") {
          return i
        } else {
          console.log("item resolve failed", i)
        }
      })
    },
    resolve_object(input) {
      if (input.merge) {
        // console.log("res.obj.:merge", input)
        // text, merge,... => text, value, ...
        const res = this.$_.cloneDeep(input)
        const merges = input.merge.map(this.get_items)
        res.value = this.$_.flatten(merges)
        delete res.merge
        return res
      } else if (input.from_tree) {
        // text, from_tree(tree,select, layers), => text, value
        // select, calls simple_select to select a node, and layers calls select_layers_from_tree_node
        //
        const res = this.$_.cloneDeep(input)
        // console.log("res. clone", res)
        const value = this.select_from_tree(input.from_tree)
        // console.log("res val", value)
        res.value = value
        delete res.from_tree
        return res
      } else {
        return input
      }
    },
    resolve_code_entry(entry_slug) {
      // todo mnaa
      const code_entry = this.get_code_entry(entry_slug)
      if (code_entry) {
        return this.create_tags(code_entry)
      } else {
        console.log("no code entry for slug", entry_slug)
        return []
      }
    },
    get_options(items) {
      if (!Array.isArray(items)) {
        console.log("options must be array")
        return []
      }
      return transform_options_list(items)
    },
    build_list(input) {
      const items = this.get_items(input, "list")
      const options = this.get_options(items)
      return options
    },
    // items_from_code_entry(entry) {
    //   if(entry.template.slug === "value_list") {
    //     return entry.values.list
    //   } else if(entry.template.slug === "value_tree") {
    //     return entry.values.root
    //   }
    // },
    select_from_tree(input_from_tree) {
      // console.log(input)
      const tree_entry = this.get_code_entry(input_from_tree.tree)
      if (!tree_entry) {
        console.log("optionsMixin.select_from_tree no code_entry", input_from_tree.tree)
        return []
      }
      let node = null
      if (input_from_tree.select) {
        // console.log(input_from_tree.select)
        node = this.simple_select(tree_entry.values, input_from_tree.select)
      } else {
        node = tree_entry.values.root
      }
      const nodes = this.select_layers_from_tree_node(node, input_from_tree.layers).map(n => n.name)
      return nodes
    }
  }
}
