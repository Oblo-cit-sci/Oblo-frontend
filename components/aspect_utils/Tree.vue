<template lang="pug">
  div
    v-treeview(:items="root_items" item-text="name" item-key="name" dense :selectable="selectable")
</template>

<script>
import {tree_cut_at_level} from "~/lib/options"

export default {
  name: "Tree",
  mixins: [],
  components: {},
  props: {
    tree: Object,
    selectable: [Boolean, Object],
    value: Object,
    max_level: Number
  },
  data() {
    return {}
  },
  computed: {
    processed_tree() {
      if(this.max_level) {
        return tree_cut_at_level(this.tree, this.max_level)
      } else {
        return this.tree
      }
    },
    root_items() {
      return this.processed_tree.root.children
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
