<template lang="pug">
  div
    v-treeview(:items="root_items"
      item-text="name"
      @input="input($event)"
      dense
      :selectable="is_edit_mode")
</template>

<script>
  import AspectComponentMixin from "~/components/aspects/AspectComponentMixin"
  import {get_codes_as_tree} from "~/lib/options"

  // todo fix item-text, item-value

  export default {
    name: "TreeMultiSelectAspect",
    mixins: [AspectComponentMixin],
    components: {},
    props: {},
    data() {
      return {}
    },
    created() {
    },
    computed: {
      tree() {
        console.log("T")
        if (typeof this.aspect.items === "string") {
          return get_codes_as_tree(this.$store, this.aspect.items)
        } else {
          return this.aspect.items
        }
      },
      id_name_map() {
        const id_map = {}
        const rec_map = (node) => {
          id_map[node.id] = node.name
          for (let kid of node.children || []) {
            rec_map(kid)
          }
        }
        rec_map(this.tree.root)
        return id_map
      },
      root_items() {
        return this.tree.root.children
      }
    },
    methods: {
      input(selection) {
        this.$emit("update_value", selection.map(id => this.id_name_map[id]))
      }
    }
  }
</script>

<style scoped>

</style>
