<template lang="pug">
  div
    div(v-if="!select")
      v-list(v-if="has_items")
        v-list-item(v-for="(item, index) in items", :key="item.key" :id="aspect_loc_str(index)")
          v-list-item-content(@click="open_item(item)")
            v-list-item-title {{index + 1}} &nbsp;
              b {{item.title}}
          v-list-item-action(v-if="!readOnly")
            v-btn(@click="open_item(item)" icon)
              v-icon edit
          v-list-item-action(v-if="!readOnly")
            v-btn(@click="open_remove(index)" icon)
              v-icon(color="red" lighten-1) close
    div(v-else)
      div v-selelct
    div(v-if="more_allowed && !readOnly")
      v-btn(@click="create_item()" :color="requieres_more_color") Add {{item_name}}
        v-icon(right) add
      .v-text-field__details
        .v-messages
    div(v-else) maximum reached
    DecisionDialog(v-bind="remove_data_dialog" :open.sync="show_remove" v-on:action="remove($event)")
</template>

<script>
    import AspectMixin from "./AspectMixin";
    import {
        ENTRY_INDEX
    } from "../../lib/consts";
    import DecisionDialog from "../DecisionDialog";
    import {create_entry} from "../../lib/entry";
    import EntryNavMixin from "../EntryNavMixin";
    import ListMixin from "../ListMixin";
    import {
        EDIT_UUID,
        ENTRIES_EDIT_ADD_REF_CHILD, ENTRIES_EDIT_DELETE_REF_CHILD,
        ENTRIES_GET_ENTRY, ENTRY_TYPE,
    } from "../../lib/store_consts";
    import {aspect_loc_str} from "../../lib/aspect";
    import {no_duplicate_texts} from "../../lib/client";

    const SELECT_THRESH = 6

    export default {
        name: "EntrylistAspect",
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
            if (!this.$store.getters[ENTRY_TYPE](this.item_type_slug)) {
                console.log("Warning- aspect: ", this.aspect.name, "referrers to a typename that does not exist: ", this.item_type_slug)
                console.log("TODO disable this aspect")
            }
        },
        computed: {
            has_items() {
                return this.$_.size(this.value) > 0
            },
            select() {
                return this.value > SELECT_THRESH
            },
            items() {
                let entries = this.$_.map(this.value, e => {
                    const entry = this.$store.getters[ENTRIES_GET_ENTRY](e)
                    return {title: entry.title, uuid: e}
                })
                no_duplicate_texts(entries, "title")
                return entries
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
                if (this.disabled)
                    return
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
                const entry = create_entry(this.$store, this.item_type_slug, {}, {
                    uuid: this.$store.getters[EDIT_UUID],
                    aspect_loc: index_aspect_loc,
                })
                this.$store.commit(ENTRIES_EDIT_ADD_REF_CHILD, {
                    child_uuid: entry.uuid,
                    aspect_loc: index_aspect_loc,
                })
                this.value_change(this.$_.concat(this.value, [entry.uuid]))
                this.to_entry(entry.uuid)
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
                if (!this.has_entry(item.uuid))
                    this.fetch_and_nav(entry.uuid)
                else {
                    this.$router.push("/entry/" + item.uuid)
                }
            }
        }
    }
</script>

<style scoped>

</style>
