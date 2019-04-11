<template lang="pug">
  div
    v-list(v-if="selection.length > 0")
      v-list-tile(v-for="(node, treelevel) in selection" :key="node[1].code")
        v-list-tile-content {{node[1].name}}
        v-list-tile-action
          v-btn(@click="remove(treelevel)" small)
            v-icon block
    v-list
      v-list-tile(v-for="(option, index) in act_options" :key="option.code")
        v-list-tile-action
          v-btn(large left color="info" @click="select(index)" small width="100px") {{option.name}}&nbsp;&nbsp;
            v-img(:src="licci_icon(option.name)" style="width:35px")
    div(v-if="selected_code !== 0") Code: {{selected_code}}
</template>

<script>

  /**
   navigate and select a leaf in a tree. data comes in as a prop.
   must have the following structure:
   every level (including top level) must contain:
   `name`, `children`, optional are `code` and `description`
   */

  export default {
    name: "TreeleafPicker",
    props: ["tree"],
    data: function () {
      return {
        selection: [], // indices of children
        act_options: [],
        selected_code: 0
      }
    },
    created() {
      this.act_options = this.tree.children;
    },
    methods: {
      licci_icon: function(licci) {
        return "icons/"+licci.substring(0,1)+".png"
      },
      select: function (index) {
        this.selection.push([index, this.act_options[index]]);
        this.selected_code = this.act_options[index].code;
        this.act_options = this.act_options[index].children;
      },
      remove: function (treelevel) {
        this.selection = this.selection.slice(0, treelevel);
        this.selected_code = 0;
        let options = this.tree.children;
        for (let node of this.selection) {
          options = options[node[0]].children;
          this.selected_code = options[node[0]].code;
        }
        this.act_options = options;
      }
    }
  }
</script>

<style scoped>

</style>
