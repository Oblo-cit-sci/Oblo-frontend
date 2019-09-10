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
    DELETE_CONTEXT_ENTRY, ASPECT
  } from "../../lib/consts";
  import DecisionDialog from "../DecisionDialog";
  import {aspect_loc_str, get_type_slug_from} from "../../lib/entry";
  import EntryNavMixin from "../EntryNavMixin";
  import ListMixin from "../ListMixin";
  import {ENTRIES_GET_ENTRY} from "../../lib/store_consts";

  const SELECT_THRESH = 6

  export default {
    name: "ListOf",
    components: {DecisionDialog},
    mixins: [AspectMixin, EntryNavMixin, ListMixin],
    data() {
      return {
        item_type_slug: get_type_slug_from(this.aspect.items),
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
          this.$emit(ENTRYACTION, {
            action: DELETE_CONTEXT_ENTRY,
            value: {uuid: ref, aspect_loc: this.aspect_loc_for_index(index)}
          })
        }
      },
      create_item() {
        /*this.$emit(ENTRYACTION, {
          action: CREATE_CONTEXT_ENTRY,
          value: {
            type_slug: this.item_type_slug,
            aspect_loc: this.aspect_loc_for_index(this.i_value.length)
          }
        })*/

          let parent_ref_data = {
              uuid: this.entry_uuid(),
              aspect_loc: this.aspect_loc,
          }
          //autosave(this.$store, this.entry)

          //const entry = create_and_store(this.item_type_slug, this.$store, parent_ref_data)
          const entry = create_entry(this.$store, this.item_type_slug)
          this.$store.commit("entries/add_ref_child",
              {
                  uuid: this.entry_uuid(),
                  child_uuid: entry.uuid,
                  aspect_loc: this.aspect_loc
              }
          )
          // todo.1
          // here we must do something to avoid blinking cuz its inserterd before leaving
          // TODO: NO IDEA HOW IT SETS THE STORE
          //set_entry_value(this.entry, this.aspect_loc, pack_value(entry.uuid))

          this.$router.push({
              path: "/entry/" + entry.uuid
          })

        this.update_indices()
      },
      aspect_loc_for_index(index) {
        return this.$_.concat(this.extra.aspect_loc, [[INDEX, index]])
      },
      aspect_loc_str(index) {
        return aspect_loc_str(this.aspect_loc_for_index(index))
      },
      open_item(item) {
        this.$emit(ENTRYACTION, {action: AUTOSAVE})
        if (!this.has_entry(item.key))
          this.fetch_and_nav(entry.uuid)
        else {
          this.$router.push("/entry/" + item.key)
        }
      },
      update_indices() {
        let entry_type = this.$store.getters.entry_type(this.item_type_slug)
        let idAspect = entry_type.content.meta.IDAspect
        if (idAspect) {
          for (let index in this.items) {
            const item = this.items[index]
            //let entry = this.$store.getters["entries/get_entry"](item.key)
            let a = [ASPECT, idAspect]
            console.log([ASPECT, idAspect], a)
            //console.log("updating value", as, [["aspect", idAspect]], a, [a])
            this.$store.commit("entries/set_entry_value", {
              uuid: item.key,
              aspect_loc: [[ASPECT, idAspect]],
              value: {value: 1 + parseInt(index)}
            })
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>
