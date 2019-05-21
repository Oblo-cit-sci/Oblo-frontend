<template lang="pug">
  div
    Title_Description(v-bind="title_description()")
    v-list(v-if="has_items")
      v-list-tile(v-for="(item, index) in item_titles", :key="item.key")
        v-list-tile-content(@click="(item)")
          v-list-tile-title {{index}} &nbsp;
            b {{item.title}}
        v-list-tile-action
          v-btn(icon @click="edit_item(item)")
            v-icon edit
        v-list-tile-action
          v-btn(icon @click="remove(index)")
            v-icon(color="grey" lighten-1) close
    div(v-if="allow_more")
      v-btn(@click="create_item()") Create
    div(v-else) maximum reached
</template>

<script>

  // TODO this is a older, reused component. beware , clean, and abstract stuff with List...
  // remove and merge

  // TODO now.
  // need to know if the items are entries or aspects
  // then let them be clicked, and let them be removed

  import AspectMixin from "./AspectMixin";
  import Title_Description from "../Title_Description";

  import { CONTEXT_ENTRY } from "~~/lib/consts";
  import {draft_url} from "../../lib/client";

  var ld = require('lodash');

  export default {
    name: "ListOf",
    components: {Title_Description},
    mixins: [AspectMixin],
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
            if(item.type === CONTEXT_ENTRY) {
              return {
                title: this.$store.state.edrafts.drafts[item.draft_id].aspects_values.title,
                key: item.draft_id,
                type: CONTEXT_ENTRY
              }
            }
        });
      }
    },
    methods: {
      remove(index) {
        this.i_value.splice(index, 1);
        this.$emit("update-required", this.i_value);
      },
      create_item() {
        this.$emit("create_related", this.aspect);
      },
      edit_item(item) {
        if(item.type === CONTEXT_ENTRY) {
          this.$router.push(draft_url(this.$store.state, item.key));
        }
      }
    }
  }
</script>

<style scoped>

</style>
