import TreeMixin from "~/lib/TreeMixin"

export default {
  name: "TagsMixin",
  mixins: [TreeMixin],
  methods: {
    create_tag_item(tag_data) {
      if (typeof tag_data === "string") {
        return tag_data
      } else {
        return tag_data.name
      }
    },
    create_tags(code_entry) {
      const tags_descr = this.$_.get(code_entry, "rules.tags")
      if (tags_descr) {
        if (tags_descr.hasOwnProperty("from_tree")) {
          return this.tags_from_tree(code_entry)
        } else if (tags_descr.hasOwnProperty("from_list")) {
          return this.tags_from_list(code_entry)
        } else {
          console.log(`code entry ${code_entry.title} has unknown tags rule`)
          return []
        }
      } else {
        console.log(`code entry ${code_entry.title} has no tags rule`)
        return []
      }
    },
    tags_from_list(code_entry) {
      const items = this.$_.get(code_entry, "values.list", [])
      return items.map(this.create_tag_item)
    },
    tags_from_tree(code_entry) {
      const tree = code_entry.values
      const tags_rules = code_entry.rules.tags.from_tree
      return this.select_layers_from_tree(tree, tags_rules).map(this.create_tag_item)
    }
  }
}
