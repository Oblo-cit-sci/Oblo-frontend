<template lang="pug">
  div
    v-treeview(:items="root_items"
      item-text="name"
      item-key="name"
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
    computed: {
      tree() {
        if (typeof this.aspect.items === "string") {
          return get_codes_as_tree(this.$store, this.aspect.items)
        } else {
          return this.aspect.items
        }
      },
      root_items() {
        return this.tree.root.children
      }
    },
    methods: {
      input(selection) {
        this.$emit("update_value", selection)
      }
    }
  }
</script>

<style scoped>

</style>
