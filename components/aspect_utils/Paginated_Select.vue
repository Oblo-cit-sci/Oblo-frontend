<template lang="pug">
  div
    Title_Description.ml-3(v-bind="act_page_title_description")
    SingleSelect.pb-1(v-if="edit_mode_list" :options="act_options" v-on:selection="select($event)" :select_sync="false" :highlight="false")
    SelectGrid(v-if="edit_mode_matrix" :options="act_options" v-on:selection="select($event)")
    SimplePaginate(v-model="page" :total_pages="this.options.length" :show_page_index="false")
</template>

<script>

  import SingleSelect from "../input/SingleSelect";
  import SelectGrid from "./SelectGrid";
  import {object_list2options} from "../../lib/options";
  import SimplePaginate from "../SimplePaginate";
  import Title_Description from "../util/Title_Description"
  /**
   * A selection of values of 2 levels (this implementation) of a tree.
   * Could also be used in order to split lists...
   */

  export default {
      name: "Paginated_Select",
      mixins: [],
      components: {Title_Description, SimplePaginate, SelectGrid, SingleSelect},
      props: {
        options: Array,
        edit_mode: String
      },
      data() {
          return {
            page: 1
          }
      },
      computed: {
        act_options() {
          // todo messing with the store?? also in treeleadpicker
          const act_children = this.options[this.page - 1].children
          for (let index in act_children) {
            let node = act_children[index]
            node["title"] = node["name"]
            node["id"] = parseInt(index)
          }
          return object_list2options(act_children, "title", "title")
        },
        edit_mode_list() {
          return this.edit_mode === "list"
        },
        edit_mode_matrix() {
          return this.edit_mode === "matrix"
        },
        act_page_title_description() {
          return {
            title: this.options[this.page - 1].name,
            description: this.options[this.page - 1].description
          }
        }
      },
      methods: {
        select(value) {
          this.$emit("selection", value)
        }
      },
      watch: {

      }
}
</script>

<style scoped>

</style>
