<template lang="pug">
  div
    div(v-if="!readOnly")
      v-list(v-if="has_items")
        v-list-item(v-for="(item, index) in items", :key="item.uuid" :id="aspect_loc_str(index)" v-if="aspect_is_on_page(index)")
          v-list-item-content(@click="open_item(item)")
            v-list-item-title {{index + 1}} &nbsp;
              b {{item.title}}
          v-list-item-action
            v-btn(@click="open_item(item)" icon)
              v-icon mdi-pencil
          v-list-item-action
            v-btn(@click="open_remove(index)" icon)
              v-icon(color="red" lighten-1) mdi-close
      .inline(v-if="more_allowed")
        v-btn(@click="create_item()" :color="requieres_more_color") Add {{item_name}}
          v-icon mdi-plus
      .inline(v-else class="mb-2") Maximum reached
      ListPagination(
        v-if="has_pagination"
        v-bind="pagination_props"
        @update:page="set_page($event)"
        @lastpage="more_follow_page = ($event)")
      .v-text-field__details
        .v-messages
    div(v-else)
      v-list-item-group(v-if="has_items")
        v-list-item(v-for="(item, index) in items",
          :key="item.key"
          :id="aspect_loc_str(index)")
          v-list-item-content(@click="open_item(item)")
            v-list-item-title {{index + 1}} &nbsp; {{item.title}}
          v-list-item-icon
            v-icon(class="fa fa-angle-right")
      ListPagination(
        v-if="has_pagination"
        v-bind="pagination_props"
        @update:page="set_page($event)"
        @lastpage="more_follow_page = ($event)")
    DecisionDialog(v-bind="remove_data_dialog" :open.sync="show_remove" v-on:action="remove($event)")
</template>

<script>
  import {
    EDIT,
    ENTRY_INDEX
  } from "../../lib/consts";
  import DecisionDialog from "../util/DecisionDialog";
  import {create_entry} from "../../lib/entry";
  import EntryNavMixin from "../EntryNavMixin";
  import ListMixin from "../ListMixin";
  import {aspect_loc_str} from "../../lib/aspect";
  import {no_duplicate_texts} from "../../lib/options";
  import ListPagination from "../aspect_utils/ListPagination";
  import PersistentStorageMixin from "../util/PersistentStorageMixin";
  import AspectComponentMixin from "./AspectComponentMixin";
  import {
    EDIT_UUID,
    ENTRIES_DELETE_ENTRY,
    ENTRIES_GET_ENTRY,
    ENTRIES_SAVE_CHILD_N_REF,
    ENTRIES_SAVE_ENTRY, ENTRIES_UPDATE_ENTRY
  } from "../../store/entries";
  import {PUSH_PAGE_PATH} from "../../store";
  import {TEMPLATES_TYPE} from "../../store/templates";

  export default {
    name: "EntrylistAspect",
    components: {DecisionDialog, ListPagination},
    mixins: [AspectComponentMixin, EntryNavMixin, ListMixin, PersistentStorageMixin],
    data() {
      return {
        item_type_slug: this.aspect.items,
        show_remove: false,
        remove_item_select: {
          id: "",
          title: ""
        },
      }
    },
    created() {
      this.set_min_max()
      if (!this.$store.getters[TEMPLATES_TYPE](this.item_type_slug)) {
        console.log("Warning- aspect: ", this.aspect.name, "referrers to a typename that does not exist: ", this.item_type_slug)
        console.log("TODO disable this aspect")
      }
      this.goto_stored_page()
      this.guarantee_page()
    },
    computed: {
      has_items() {
        return this.$_.size(this.value) > 0
      },
      items() {
        let entries = this.$_.map(this.value, e => {
          const entry = this.$store.getters[ENTRIES_GET_ENTRY](e)
          if (!entry) {
            return {title: "UNKNWON ENTRY", uuid: this.uuid}
          }
          return {title: entry.title, uuid: e}
        })
        no_duplicate_texts(entries, "title")
        return entries
      },
      remove_data_dialog() {
        return {
          id: this.remove_item_select.id,
          title: "Delete " + this.remove_item_select.title,
          text: "Are you sure you want to delete " + this.remove_item_select.title + "?",
          confirm_text: "delete",
          cancel_color: "success",
          confirm_color: "error"
        }
      }
    },
    methods: {
      open_remove(index) {
        if (this.disabled)
          return
        this.remove_item_select = {
          id: index,
          title: this.items[index].title
        }
        this.remove_data_dialog.id = index
        this.show_remove = true
      },
      remove(action) {
        if (action.confirm) {
          let index = parseInt(action.id)
          let child_uuid = this.value[index]
          this.$store.dispatch(ENTRIES_DELETE_ENTRY, child_uuid)
          this.guarantee_page()
        }
      },
      create_item() {
        if (this.disabled)
          return
        const index_aspect_loc = this.aspect_loc_for_index(this.value.length)
        const child = create_entry(this.$store, this.item_type_slug, {}, {
          uuid: this.$store.getters[EDIT_UUID],
          aspect_loc: index_aspect_loc,
        })
        // saving the child, setting refrences, saving this entry(title),
        this.$store.dispatch(ENTRIES_SAVE_CHILD_N_REF, {child: child, aspect_loc: index_aspect_loc})
        // todo maybe not required, since the dispatch takes care of it
        this.update_value(this.$_.concat(this.value, [child.uuid]))
        this.persist_draft_numbers()
        this.persist_entries()
        // goto
        // console.log("EL asp", this.$route)
        this.$store.commit(PUSH_PAGE_PATH, this.$route)
        this.to_entry(child.uuid, EDIT)
        this.goto_delayed_last_page()
      },
      aspect_loc_for_index(index) {
        return this.$_.concat(this.$_.drop(this.aspect_loc), [[ENTRY_INDEX, index]])
      },
      aspect_loc_str(index) {
        return aspect_loc_str(this.aspect_loc_for_index(index))
      },
      open_item(item) {
        if (this.disabled)
          return
        this.persist_entries()
        this.$store.dispatch(ENTRIES_UPDATE_ENTRY, this.entry_uuid())
        if (!this.has_entry(item.uuid))
          this.fetch_and_nav(item.uuid)
        else {
          // todo, not always edit: parent is owned, but child not, ...
          // console.log("EL asp", this.$route)
          this.$store.commit(PUSH_PAGE_PATH, this.$route)
          this.to_entry(item.uuid, this.mode)
        }
      }
    }
  }
</script>

<style scoped>

  .inline {
    display: inline-block;
  }
</style>
