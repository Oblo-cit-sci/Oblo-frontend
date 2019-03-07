<template lang="pug">
  div
    v-list(v-if="selection.length > 0")
      v-list-tile(v-for="(node, treelevel) in selection" :key="node[1].code")
        v-list-tile-content {{node[1].name}}
        v-list-tile-action
          v-btn(@click="remove(treelevel)")
            v-icon block
    v-list
      v-list-tile(v-for="(option, index) in act_options" :key="option.code")
        v-btn(color="info" @click="select(index)") {{option.name}}
    div(v-if="selected_code !== 0") Code: {{selected_code}}
</template>

<script>

  let licci_tree = require("../codes/licci-tree");

  export default {
    name: "TreeleafPicker",
    data: function () {
      return {
        tree: licci_tree,
        selection: [], // indices of children
        act_options: licci_tree.children,
        selected_code: 0
      }
    },
    methods: {
      select: function (index) {
        this.selection.push([index, this.act_options[index]]);
        this.selected_code = this.act_options[index].code;
        this.act_options = this.act_options[index].children;
      },
      remove: function (treelevel) {
        this.selection = this.selection.slice(0,treelevel);
        this.selected_code = 0;
        let options = licci_tree.children;
        for(let node of this.selection) {
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
