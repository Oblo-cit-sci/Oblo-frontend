<template lang="pug">
  div
    div(v-if="!select")
      v-list(v-if="has_items")
        v-list-tile(v-for="(item, index) in item_titles", :key="item.key")
          v-list-tile-content(@click="(item)")
            v-list-tile-title {{index + 1}} &nbsp;
              b {{item.title}}
          v-list-tile-action
            v-btn(icon @click="edit_item(index)")
              v-icon edit
          v-list-tile-action
            v-btn(icon @click="open_remove(index)")
              v-icon(color="red" lighten-1) close
    div(v-else)
      div v-selelct
    div(v-if="allow_more")
      v-btn(@click="create_item()") Create
    div(v-else) maximum reached
    DecisionDialog(v-bind="remove_data_dialog" :open.sync="show_remove" v-on:action="remove($event.id)")
</template>

<script>

  // TODO this is a older, reused component. beware , clean, and abstract stuff with List...
  // remove and merge

  // TODO now.
  // need to know if the items are entries or aspects
  // then let them be clicked, and let them be removed

  import AspectMixin from "./AspectMixin";

  import { CONTEXT_ENTRY } from "~~/lib/consts";
  import DecisionDialog from "../DecisionDialog";
  import {delete_local_entry, get_edit_route_for_ref, get_id, get_local_entry} from "../../lib/entry";

  var ld = require('lodash');

  const SELECT_THRESH = 6

  export default {
    name: "ListOf",
    components: {DecisionDialog},
    mixins: [AspectMixin],
    data() {
      return {
        show_remove: false,
        remove_data_dialog: {
          id: "",
          title: "Delete village",
          text: "Are you sure you want to delete this village?"
        },
        entry_refs: [] // either drafts or entries
      }
    },
    computed: {
      has_items() {
        return ld.size(this.i_value) > 0
      },
      allow_more() {
        if (!this.aspect.attr.hasOwnProperty("max")) {
          return true
        } else {
          return this.i_value.length < this.aspect.attr.max
        }
      },
      item_titles(){
        return ld.map(this.i_value, (item) => {
            // not necessarily local
            if(item.type === CONTEXT_ENTRY) {
              return {
                title: get_local_entry(this.$store, item).aspects_values.title,
                key: get_id(this.$store, item),
                type: CONTEXT_ENTRY
              }
            }
        });
      },
      select() {
        return this.i_value > SELECT_THRESH
      },
    },
    methods: {
      open_remove(index) {
        console.log("open remove index", index)
        this.remove_data_dialog.id = index
        this.show_remove = true
      },
      remove(index) {
        index = parseInt(index)
        const item = this.i_value[index]
        delete_local_entry(this.$store, item)
        this.i_value.splice(parseInt(index), 1)
        this.value_change(this.i_value)
      },
      create_item() {
        this.$emit("create_ref", this.aspect)
      },
      edit_item(index) {
        const item = this.i_value[index]
        if(item.type === CONTEXT_ENTRY) {
          this.$router.push( get_edit_route_for_ref(this.$store, item))
        }
      }
    }
  }
</script>

<style scoped>

</style>
