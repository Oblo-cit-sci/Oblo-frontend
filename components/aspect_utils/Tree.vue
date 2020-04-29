<template lang="pug">
  div
    v-treeview(:items="root_items" item-text="name" item-key="name" dense :selectable="selectable" @input="input($event)")
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
    // value: Object,
  },
  data() {
    return {}
  },
  computed: {
    root_items() {
      return this.tree.root.children
    }
  },
  methods: {
    input(selection) {
      console.log(selection)
      //this.$emit("input", selection)
      this.$emit("update_value", selection)
    }
  }
}
</script>

<style scoped>

</style>
