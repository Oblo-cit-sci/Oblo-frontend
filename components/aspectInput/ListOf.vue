<template lang="pug">
  div
    div(v-if="!select")
      v-list(v-if="has_items")
        v-list-tile(v-for="(item, index) in items", :key="item.key" :id="aspect_loc_str(index)")
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
    div(v-if="more_allowed && !readOnly")
      v-btn(@click="create_item()" :color="requieres_more_color") Add {{item_name}}
        v-icon(right) add
    div(v-else) maximum reached
    DecisionDialog(v-bind="remove_data_dialog" :open.sync="show_remove" v-on:action="remove($event)")
</template>

<script>
    import AspectMixin from "./AspectMixin";
    import {
        CONTEXT_ENTRY,
        INDEX
    } from "../../lib/consts";
    import DecisionDialog from "../DecisionDialog";
    import {create_entry, get_uuid} from "../../lib/entry";
    import EntryNavMixin from "../EntryNavMixin";
    import ListMixin from "../ListMixin";
    import {ENTRIES_ADD_REF_CHILD, ENTRIES_GET_ENTRY, ENTRIES_SET_ENTRY_VALUE} from "../../lib/store_consts";
    import {aspect_loc_str} from "../../lib/aspect";

    const SELECT_THRESH = 6

    export default {
        name: "ListOf",
        components: {DecisionDialog},
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
        },
        computed: {
            has_items() {
                return this.$_.size(this.i_value) > 0
            },
            select() {
                return this.i_value > SELECT_THRESH
            },
            items() {
                return this.$_.map(this.value, (item) => {
                    const entry = this.$store.getters[ENTRIES_GET_ENTRY](item)
                    return {
                        title: entry.title,
                        key: item,
                        type: CONTEXT_ENTRY
                    }
                })
            },
            remove_data_dialog() {
                return {
                    id: this.remove_item_select.id,
                    title: "Delete " + this.remove_item_select.title,
                    text: "Are you sure you want to delete this " + this.remove_item_select.title + "?",
                    confirm_text: "delete",
                    cancel_color: "success",
                    confirm_color: "error"
                }
            }
        },
        methods: {
            open_remove(index) {
                this.remove_data_dialog.id = index
                this.show_remove = true
            },
            remove(action) {
                if (action.confirm) {
                    let index = parseInt(action.id)
                    const ref = this.i_value[index]
                    this.i_value.splice(parseInt(index), 1)
                    this.value_change(this.i_value)
                    // TODO
                    /*this.$emit(ENTRYACTION, {
                        action: DELETE_CONTEXT_ENTRY,
                        value: {uuid: ref, aspect_loc: this.aspect_loc_for_index(index)}
                    })*/
                    this.value
                }
            },
            create_item() {
                const stripped_aspect_loc = this.$_.drop(this.aspect_loc)
                const entry = create_entry(this.$store, this.item_type_slug, {}, {
                    uuid: get_uuid(this.aspect_loc),
                    aspect_loc: stripped_aspect_loc,
                    index: this.i_value.length
                })
                this.$store.commit(ENTRIES_ADD_REF_CHILD, {
                    uuid: get_uuid(this.aspect_loc),
                    child_uuid: entry.uuid,
                    aspect_loc: stripped_aspect_loc,
                    index: this.i_value.length
                })
                this.to_entry(entry.uuid)
                this.value_change(this.$_.concat(this.i_value, [entry.uuid]))
            },
            aspect_loc_for_index(index) {
                return this.$_.concat(this.aspect_loc, [[INDEX, index]])
            },
            aspect_loc_str(index) {
                return aspect_loc_str(this.aspect_loc_for_index(index))
            },
            open_item(item) {
                if (!this.has_entry(item.key))
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
