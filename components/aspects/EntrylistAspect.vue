<template lang="pug">
  div
    div(v-if="!readOnly")
      v-list(v-if="has_items")
        v-list-item(v-for="(item, index) in items", :key="item.key" :id="aspect_loc_str(index)" v-if="aspect_is_on_page(index)")
          v-list-item-content(@click="open_item(item)")
            v-list-item-title {{index + 1}} &nbsp;
              b {{item.title}}
          v-list-item-action
            v-btn(@click="open_item(item)" icon)
              v-icon edit
          v-list-item-action
            v-btn(@click="open_remove(index)" icon)
              v-icon(color="red" lighten-1) close
      .inline(v-if="more_allowed")
          v-btn(@click="create_item()" :color="requieres_more_color") Add {{item_name}}
            v-icon(right) add
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
    import AspectMixin from "./AspectMixin";
    import {
        EDIT,
        ENTRY_INDEX
    } from "../../lib/consts";
    import DecisionDialog from "../DecisionDialog";
    import {create_entry} from "../../lib/entry";
    import EntryNavMixin from "../EntryNavMixin";
    import ListMixin from "../ListMixin";
    import {
        EDIT_UUID,
        ENTRIES_EDIT_DELETE_REF_CHILD,
        ENTRIES_GET_ENTRY, ENTRIES_SAVE_CHILD_N_REF, ENTRIES_SAVE_ENTRY, ENTRY_TYPE,
    } from "../../lib/store_consts";
    import {aspect_loc_str} from "../../lib/aspect";
    import {no_duplicate_texts} from "../../lib/options";
    import ListPagination from "../ListPagination";



    export default {
        name: "EntrylistAspect",
        components: {DecisionDialog, ListPagination},
        mixins: [AspectMixin, EntryNavMixin, ListMixin],
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
            if (!this.$store.getters[ENTRY_TYPE](this.item_type_slug)) {
                console.log("Warning- aspect: ", this.aspect.name, "referrers to a typename that does not exist: ", this.item_type_slug)
                console.log("TODO disable this aspect")
            }
            this.goto_stored_page()
        },
        computed: {
            has_items() {
                return this.$_.size(this.value) > 0
            },
            items() {
                console.log("items", this.value)
                let entries = this.$_.map(this.value, e => {
                    const entry = this.$store.getters[ENTRIES_GET_ENTRY](e)
                    console.log("e", entry)
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
                    this.$store.commit(ENTRIES_EDIT_DELETE_REF_CHILD, child_uuid)
                    const mod_value = this.$_.filter(this.value, (_, i) => {
                        return i !== index
                    })
                    this.value_change(mod_value)
                }
            },
            create_item() {
                if (this.disabled)
                    return
                const index_aspect_loc = this.aspect_loc_for_index(this.value.length)
                //console.log("index_aspect_loc", index_aspect_loc)
                const child = create_entry(this.$store, this.item_type_slug, {}, {
                    uuid: this.$store.getters[EDIT_UUID],
                    aspect_loc: index_aspect_loc,
                })
                // saving the child, setting refrences, saving this entry(title),
                this.$store.dispatch(ENTRIES_SAVE_CHILD_N_REF, {child: child, aspect_loc: index_aspect_loc})
                this.value_change(this.$_.concat(this.value, [child.uuid]))
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
                this.$store.dispatch(ENTRIES_SAVE_ENTRY)
                if (!this.has_entry(item.uuid))
                    this.fetch_and_nav(item.uuid)
                else {
                    // todo, not always edit: parent is owned, but child not, ...
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
