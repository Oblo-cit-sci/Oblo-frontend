<template lang="pug">
  div
    v-treeview(:items="root_items"
      item-key="value"
      item-text="text"
      return-object
      :value="i_value"
      @input="input($event)"
      dense
      :selection-type="selection_type"
      :selectable="is_edit_mode")
</template>

<script>
import AspectComponentMixin from "~/components/aspects/AspectComponentMixin"
import {get_codes_as_tree} from "~/lib/options"
import TreeSelectComponentMixin from "~/components/aspect_utils/TreeSelectComponentMixin";

// todo how to get tag (different groups on different levels)
export default {
  name: "TreeMultiSelectAspect",
  mixins: [AspectComponentMixin, TreeSelectComponentMixin],
  components: {},
  props: {},
  data() {
    return {}
  },
  created() {
    this.calc_options(this.allow_select_levels)
  },
  computed: {
    i_value() {
      return this.value || []
    },
    independent() {
      return this.$_.get(this.attr, "independent", false)
    },
    allow_select_levels() {
      return this.$_.get(this.attr, "allow_select_levels", null)
    },
    selection_type() {
      if (this.independent) {
        return "independent"
      } else {
        return "leaf"
      }
    },
    // id_name_map() {
    //   const id_map = {}
    //   const rec_map = (node) => {
    //     id_map[node.id] = node.value
    //     for (let kid of node.children || []) {
    //       rec_map(kid)
    //     }
    //   }
    //   rec_map(this.tree.root)
    //   return id_map
    // },
    root_items() {
      return this.tree.root.children
    }
  },
  methods: {
    input(selection) {
      // console.log(selection)
      this.update_value(selection.map(s => ({value:s.value, text: s.text}))) // selection.map(id => this.id_name_map[id]))
    }
  }
}
</script>

<style scoped>

</style>
