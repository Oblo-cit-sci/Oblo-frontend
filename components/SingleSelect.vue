<template lang="pug">
  div.pa-0(v-if="view_clearlist")
    v-list.pa-0(
      :three-line="has_some_description"
      dense
      class="singleselect_list"
    )
      div(v-for="item of options")
        v-subheader(v-if="is_category(item)") {{item.text}}
        v-list-item(v-else
        :key="item.value"
          @click="select(item)"
          :class="{ marked: marked(item.value) }"
          class="single_select")
          v-list-item-avatar(v-if="has_some_icons" tile)
            v-img(:src="icon_path(item)")
          v-list-item-content.align-self-center
            v-list-item-title {{item.text}}
            v-list-item-subtitle {{item.description}}
          v-list-item-action.align-self-center(v-if="create")
            v-spacer
            v-icon(color="grey lighten-1") mdi-login-variant
        v-divider
  div(v-else-if="view_select")
    v-select(outlined single-line hide-details :multiple=false v-model="selected_item" :items="options" return-object clearable :placeholder="placeholder" :disabled="disabled" )
  div(v-else-if="view_autocomplete")
    v-autocomplete(outlined single-line v-model="selected_item" :items="options" clearable return-object)
  div(v-else-if="view_radiogroup")
    v-radio-group(:row="true"  v-model="selected_item")
      v-radio(v-for="item of options" :key="item.key" :label="item.text" :value="item.value")
  div(v-else-if="none")
    div Nothing to select from
</template>

<script>

    /*
    OPTIONS NEED TO HAVE
    text, value
    and optional "description"
     */

    import {server_icon_path} from "../lib/client";

    let select_tresh = 6;
    let autocomplet_thresh = 20

    const NONE = -1
    const CLEAR_LIST = "list";
    const SELECT = "select";
    const AUTOCOMPLETE = "autocomplete"

    const RADIOGROUP = "radiogroup"

    export const VIEW_OPTIONS = {
        none: NONE,
        list: CLEAR_LIST,
        select: SELECT,
        autocomplete: AUTOCOMPLETE,
        radiogroup: RADIOGROUP
    }

    export default {
        name: "SingleSelect",
        props: {
            options: Array,
            selection: [Object, String],
            highlight: {
                type: Boolean,
                default: true
            },
            select_sync: {
                type: Boolean,
                default: true
            },
            force_view: {
                type: String,
                default: undefined
            }, // either (CLEAR_LIST | VUETIFY_SELECT)
            only_value: {
                type: Boolean
            },
            disabled: {
                type: Boolean,
            },
            placeholder: String, // only select
            create: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                viewStyle: CLEAR_LIST,
                selected_item: null, // for v-select
                view_options: VIEW_OPTIONS,
                radioselect_test: "view",
                emit_only_value: false
            }
        },
        created() {
            //console.log("Selection create", this.selection)
            this.emit_only_value = this.only_value
            if (this.selection) {
                this.set_selected_item(false)
            }
            if (this.force_view) {
                this.viewStyle = this.view_options[this.force_view];
                if (this.viewStyle === RADIOGROUP) {
                    this.emit_only_value = true
                    this.set_selected_item(false)
                }
                if (!this.viewStyle) {
                    console.log("Error unknown force_view", this.force_view, "should be from:", this.view_options)
                }
            } else {
                this.set_view_style()
            }
        },
        beforeUpdate() {
            if (!this.force_view) {
                this.set_view_style()
            }
        },
        methods: {
            select(item) {
                if (this.disabled)
                    return
                if (item.value === undefined)
                    return;
                if (this.selection && this.selection.value === item.value) {
                    this.emitUp(null)
                } else {
                    this.emitUp(item)
                }
            },
            set_view_style() {
                let sz = this.$_.size(this.options)
                if (sz === 0) {
                    this.viewStyle = NONE
                } else if (sz < select_tresh) {
                    this.viewStyle = CLEAR_LIST
                } else if (sz < autocomplet_thresh) {
                    this.viewStyle = SELECT
                } else {
                    this.viewStyle = AUTOCOMPLETE
                }
            },
            icon_path(item) {
                if (item.icon) {
                    return server_icon_path(this.$axios, item.icon)
                } else return ""
            },
            marked(key) {
                if (this.selection)
                    return key === this.selection.value && this.highlight;
            },
            is_category(item) {
                return item.type === "category"
            },
            emitUp(item) {
                console.log("emitUp", item)
                // todo maybe just one emit?
                // but item might already be string, ...
                const event = this.emit_only_value ? (typeof item === "string" ? item : item.value) : item
                //console.log("emit", item, this.select_sync)
                if (this.select_sync) {
                    this.$emit('update:selection', event) // refactor to use the item
                } else {
                    //console.log("emit no sync")
                    this.$emit("selection", event)
                }
            },
            set_selected_item() {
                //console.log("set_selected_item", this.selected_item, this.only_value, this.selection)
                if (this.emit_only_value) {
                    this.selected_item = this.selection
                } else {
                    if (typeof this.selection === "string") {
                        this.emit_only_value = true
                        this.selected_item = this.$_.find(this.options, (o) => {
                            return o.value === this.selection
                        })
                    } else {
                        this.selected_item = this.selection;
                    }
                }
            }
        },
        computed: {
            has_some_description() {
                return this.$_.find(this.options, (o) => o.description && o.description !== "") !== undefined
            },
            has_some_icons() {
                return this.$_.find(this.options, (o) => o.icon && o.icon !== "") !== undefined
            },
            view_clearlist() {
                return this.viewStyle === CLEAR_LIST
            },
            view_select() {
                return this.viewStyle === SELECT
            },
            view_autocomplete() {
                return this.viewStyle === AUTOCOMPLETE
            },
            view_radiogroup() {
                return this.viewStyle === RADIOGROUP
            },
            none() {
                return this.viewStyle === NONE
            }
        },
        watch: {
            selected_item(item) {
                this.emitUp(item)
                /* console.log("emitup", item)
                if (typeof item === "object") {
                    this.emitUp(item.value)
                } else if (typeof item === "string") {
                    this.emitUp(item)
                } else {
                  console.log("SingleSelect. unknown type to emit up")
                }*/
            },
            selection(val) {
                this.set_selected_item()
            }
        }
    }
</script>

<style scoped>
  .singleselect_list {
    margin-bottom: 1%;
  }

  .single_select {
    min-height: 35px;
  }

  .marked {
    background: khaki;
  }

  .category {
    background: lightgrey;
    width: 100%;
  }
</style>
