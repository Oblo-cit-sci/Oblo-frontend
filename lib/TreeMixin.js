export default {
  name: "TreeMixin",
  methods: {
    simple_select(tree, select) {
      return this.$_.get(tree.root, select, tree.root)
    },
    select_layers_from_tree_node(node, level_indices) {
      // console.log("-", node, level_indices)
      const results = []
      const rec_grab = (node, level = 0) => {
        if (level_indices.includes(level)) {
          results.push(node)
        }
        for (let kid of node.children || []) {
          rec_grab(kid, level + 1)
        }
      }
      rec_grab(node)
      return results
    },
    select_layers_from_tree(tree, tag_rules) {
      // console.log(tree.levels)
      // console.log("from tree")
      const level_names = tree.levels.map(l => {
        if (typeof l === "string") {
          return l
        } else {
          return l.name
        }
      })
      // console.log("levels", level_names)
      const select_levels = tag_rules.levels
      // console.log(select_levels)
      const level_indices = select_levels.map(l => {
        if (typeof l === "string") {
          return level_names.indexOf(l) + 1
        } else {
          return l
        }
      })
      // console.log("selected levels", select_levels, level_indices)
      return this.select_layers_from_tree_node(tree.root, level_indices)
    },
    get_layer_indices(tree, layer_names_indices) {
      const level_names = tree.levels
      return layer_names_indices.map(l => {
        if (typeof l === "string") {
          return level_names.indexOf(l) + 1
        } else {
          return l
        }
      })
    }
  }
}
