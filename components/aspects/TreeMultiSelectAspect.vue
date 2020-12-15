<template lang="pug">
  div
    v-treeview(:items="root_items"
      item-key="value"
      item-text="text"
      :value="i_value"
      @input="input($event)"
      dense
      :selectable="is_edit_mode")
</template>

<script>
  import AspectComponentMixin from "~/components/aspects/AspectComponentMixin"
  import {get_codes_as_tree} from "~/lib/options"
  import TreeSelectComponentMixin from "~/components/aspect_utils/TreeSelectComponentMixin";
  import {pack_value} from "~/lib/aspect";

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
      this.calc_options()
    },
    computed: {
      i_value() {
        return this.value || []
      },
      root_items() {
        return this.tree.root.children
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
      input(selection) {
        // console.log(selection)
        this.update_value(selection) // selection.map(id => this.id_name_map[id]))
      }
    }
  }
</script>

<style scoped>

</style>
