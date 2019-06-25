<template lang="pug">
  div
    div(v-if="!select")
      v-list(v-if="has_items")
        v-list-tile(v-for="(item, index) in items", :key="item.key")
          v-list-tile-content(@click="open_item(item)")
            v-list-tile-title {{index + 1}} &nbsp;
              b {{item.title}}
          v-list-tile-action(v-if="!readOnly")
            v-btn(@click="open_item(item)" icon)
              v-icon edit
          v-list-tile-action(v-if="!readOnly")
            v-btn(@click="open_remove(index)" icon)
              v-icon(color="red" lighten-1) close
    div(v-else)
      div v-selelct
    div(v-if="allow_more && !readOnly")
      v-btn(@click="create_item()") Create {{aspect.attr.itemname}}
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

  import {
    ENTRYACTION,
    CONTEXT_ENTRY,
    CREATE_CONTEXT_ENTRY,
    INDEX,
    AUTOSAVE,
    DELETE_CONTEXT_ENTRY
  } from "../../lib/consts";
  import DecisionDialog from "../DecisionDialog";
  import {get_type_slug_from} from "../../lib/entry";
  import EntryNavMixin from "../EntryNavMixin";


  const SELECT_THRESH = 6

  export default {
    name: "ListOf",
    components: {DecisionDialog},
    mixins: [AspectMixin, EntryNavMixin],
    data() {
      return {
        show_remove: false,
        remove_data_dialog: {
          id: "",
          title: "Delete village",
          text: "Are you sure you want to delete this village?",
          confirm_text: "delete",
          cancel_color: "success",
          confirm_color: "error"
        },
        entry_refs: [], // either drafts or entries,
      }
    },
    computed: {
      has_items() {
        return this.$_.size(this.i_value) > 0
      },
      allow_more() {
        if (!this.aspect.attr.hasOwnProperty("max")) {
          return true
        } else {
          return this.i_value.length < this.aspect.attr.max
        }
      },
      select() {
        return this.i_value > SELECT_THRESH
      },
      items() {
        return this.$_.map(this.value, (item) => {
          console.log(item)
          //if(item.type === CONTEXT_ENTRY) {
          const entry = this.$store.getters["entries/get_entry"](item.value)
          return {
            title: entry.title,
            key: item.value,
            type: CONTEXT_ENTRY
          }
          //}
        })
      }
    },
    methods: {
      open_remove(index) {
        //console.log("open remove index", index)
        this.remove_data_dialog.id = index
        this.show_remove = true
      },
      remove(index) {
        index = parseInt(index)
        const item = this.i_value[index]
        this.i_value.splice(parseInt(index), 1)
        this.value_change(this.i_value)
        this.$emit(ENTRYACTION, {
          action: DELETE_CONTEXT_ENTRY,
          aspect_loc: ""
        })
      },
      create_item() {
        console.log("ListOf.create, ", this.i_value, this.i_value.constructor)
        this.$emit(ENTRYACTION, {
          action: CREATE_CONTEXT_ENTRY,
          value: {
            type_slug: get_type_slug_from(this.aspect.items),
            // todo rather a push
            aspect_loc: this.$_.concat(this.extra.aspect_loc, [[INDEX, this.i_value.length]])
          }
        })
      },
      open_item(item) {
        this.$emit(ENTRYACTION, {action: AUTOSAVE})
        if(!this.has_entry(item.key))
          this.fetch_and_nav(entry.uuid)
        else {
          this.$router.push("/entry/" + item.key)
        }
      }
    }
  }
</script>

<style scoped>

</style>
