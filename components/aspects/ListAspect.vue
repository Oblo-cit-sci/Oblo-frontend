<template lang="pug">
  div
    div(v-if="is_simple")
      div(v-for="(value, index) in value" :key="index")
        div(v-if="aspect_is_on_page(index)" :id="panel_id(index)")
          Aspect(
            v-bind="list_aspect_props(index)"
            v-on:entryAction="handleEntryAction($event, index)"
            v-on:append-outer="remove_value(index)")
          ListitemActions(
            v-if="!readOnly"
            v-bind="listitem_actions_prop(index)"
            v-on:remove_value="remove_value($event)"
            v-on:move="move($event)")
    div(v-else class="mb-1 mt-1")
      v-expansion-panels(
        multiple
        v-model="panelState")
        v-expansion-panel(
          v-if="aspect_is_on_page(index)"
          v-for="(value, index) in value"
          :key="index"
          :id="panel_id(index)")
          v-expansion-panel-header {{titles[index]|| index + 1}}
          v-expansion-panel-content
            Aspect(
              v-bind="list_aspect_props(index)"
              v-on:entryAction="$emit('entryAction',$event)")
            ListitemActions(v-if="!readOnly"
              v-bind="listitem_actions_prop(index)"
              v-on:remove_value="remove_value($event)"
              v-on:move="move($event)")
    MinMaxIndicators(
      v-if="!readOnly"
      :aspect="aspect"
      :length="this.value.length"
      :min="this.min"
      :max="this.max")
    .inline(v-if="is_public && !fixed_length")
      v-btn(:disabled="!more_allowed" @click="add_value()" :color="requieres_more_color") Add {{item_name}}
        v-icon(right) add
    ListPagination(
      v-if="has_pagination"
      v-bind="pagination_props"
      @update:page="set_page($event, goto_panel_id($event))"
      @lastpage="more_follow_page = ($event)")
      .v-text-field__details
        .v-messages
</template>

<script>

    import AspectMixin from "./AspectMixin";
    import Aspect from "../Aspect";
    import ListMixin from "../ListMixin";
    import {INDEX, PRIVATE, PUBLIC, EDIT} from "../../lib/consts";
    import {
        aspect_loc_str,
        packed_aspect_default_value,
        get_aspect_vue_component,
        remove_entry_loc
    } from "../../lib/aspect";
    import ListitemActions from "../ListitemActions";
    import Paginate from "../Paginate";
    import MinMaxIndicators from '../list_components/MinMaxIndicators'

    import ListPagination from "../ListPagination";
    import {get_codes_as_options} from "../../lib/options";
    import goTo from 'vuetify/lib/services/goto'

    const SIMPLE = "simple"
    const PANELS = "panels"


    export default {
        name: "ListAspect",
        components: {ListPagination, Paginate, ListitemActions, Aspect, MinMaxIndicators},
        mixins: [AspectMixin, ListMixin],
        data() {
            return {
                item_aspect: null,
                structure: null,
                count: true,
                // for composite
                panelState: [],
                select: false, // select... instead of button
                options: [],
                new_edit: []
                //
            }
        },
        created() {
            //console.log("LA created", this.value)
            let item_type = this.aspect.items;
            // todo. list, are extended lists by user, not select lists
            if (typeof (item_type) === "string") {
                switch (item_type) {
                    case "str":
                        this.structure = SIMPLE
                        break;
                    case "int":
                        this.structure = SIMPLE
                        break
                    default:
                        console.log("unknown type for list", item_type);
                }
                this.item_aspect = {
                    attr: {},
                    type: this.aspect.items,
                }
            } else if (typeof (item_type) === "object") {
                //console.log("object type", this.aspect.items)
                if (this.aspect.items.type === "composite" || this.aspect.attr.force_panels) {
                    this.item_aspect = this.aspect.items;
                    this.structure = PANELS
                    // get the titles // should cause having the panel titles when entry is entered
                    this.titles
                    // fill in the values of the titleAspect
                } else {
                    this.item_aspect = this.aspect.items;
                    this.structure = SIMPLE;
                }
            }
            // not sure if this would still be an extra or attr...

            if (this.extra.ref_length) {
                if (this.extra.ref_length !== this.value.length) {
                    const diff = this.extra.ref_length - this.value.length
                    if (diff > 0)
                        this.add_value(diff)
                    else if (diff < 0) {
                        // remove some from the end
                        // todo
                    }
                }
                this.min = this.extra.ref_length
                this.max = this.extra.ref_length
            }

            this.set_min_max()
            if (this.value.length === 0) {
                for (let i = 0; i < this.aspect.attr.create || 0; i++) {
                    this.add_value()
                }
            }
            const entry = this.get_entry()
            if (entry.local.list_pages) {
                const loc_str = aspect_loc_str(remove_entry_loc(this.aspect_loc))
                if (entry.local.list_pages[loc_str] !== undefined) {
                    this.set_page(entry.local.list_pages[loc_str])
                }
            }
        },
        methods: {
            clearableAspectComponent(aspect) {
                return get_aspect_vue_component(aspect, this.mode)
            },
            add_value(n = 1) {
                let additional = []
                for (let i = 0; i < n; i++) {
                    additional.push(packed_aspect_default_value(this.item_aspect))
                    this.value_change(this.$_.concat(this.value, additional))
                    this.goto_delayed_last_page(this.goto_panel_id())
                    setTimeout(() => {
                        if (!this.is_simple) {
                            this.panelState = [(this.value.length + this.pagination_tresh - 1) % this.pagination_tresh]
                        }
                    }, 20)
                }
                this.new_edit.push(this.value.length);
            },
            list_aspect_props(index) {
                return {
                    aspect: this.indexed_item_aspect(index),
                    mode: this.$_.includes(this.new_edit, index) ? EDIT : this.mode,
                    aspect_loc: this.item_aspect_loc(index),
                    extra: this.list_extra(index)
                }
            },
            listitem_actions_prop(index) {
                return {
                    requires_delete: this.requires_delete,
                    itemname: this.extra.itemname,
                    moveable: this.moveable,
                    index: index,
                    listlength: this.value.length - 1
                }
            },
            remove_value(index) {
                this.value_change(this.$_.filter(this.value, (val, i) => {
                    return index !== i
                }))
                if (this.structure === PANELS) {
                    this.panelState = []
                }
            },
            move(index_direction) {
                const index = index_direction[0]
                const direction = index_direction[1]
                const to_move = this.value[index]
                const without = this.$_.filter(this.value, (e, i) => i !== index)
                const new_left = this.$_.take(without, index + direction)
                const new_right = this.$_.takeRight(without, without.length - (index + direction))
                this.value_change(this.$_.concat(new_left, to_move, new_right))
                // fix panelstates todo
                if (this.structure === PANELS) {
                    this.panelState = [index + direction]
                }

                goTo("#" + this.panel_id(index + direction), {
                    duration: 400,
                    easing: "easeOutCubic"
                })
            },
            item_aspect_loc(index) {
                return this.$_.concat(this.aspect_loc, [[INDEX, index]])
            },
            indexed_item_aspect(index) {
                let aspect = {...this.item_aspect}
                aspect.name = "" + (index + 1)
                return aspect
            }, handleEntryAction(event, index) {
                if (event.action === "clear") {
                    this.remove_value(index)
                } else {
                    $emit('entryAction', $event)
                }
            },
            list_extra(index) {
                return {
                    no_title: this.aspect.attr.hasOwnProperty("no_titles") ? this.aspect.attr.no_titles : false,
                    clear: false,
                    listitem: true,
                    list_index: index
                }
            },
            panel_id(index) {
                return "L-" + aspect_loc_str(this.$_.slice(this.$_.concat(this.aspect_loc, [[INDEX, index]]), 1))
            },
            index_on_act_page(index) {
                return index >= this.page * this.pagination_tresh && index < (this.page + 1) * this.pagination_tresh
            },
            goto_panel_id(page = this.page) {
                return this.is_simple ? undefined : this.panel_id(parseInt(page * this.pagination_tresh))
            }
        },
        computed: {
            is_simple() {
                return this.structure === SIMPLE
            },
            fixed_length() {
                return this.extra.ref_length !== undefined
            },
            moveable() {
                return this.aspect.attr.moveable || false
            },
            requires_delete() {
                let itemtype = this.aspect.items.type
                return !(itemtype === "str" || itemtype === "int" || itemtype === "float");
            },
            titles() {
                let titles = new Array(this.value.length)
                if (this.aspect.attr.indexTitle || this.aspect.attr.force_panels) { // indexTitle or non-complex panels
                    for (let i = 0; i < titles.length; i++) {
                        titles[i] = this.aspect.attr.itemname + " " + (parseInt(i) + 1).toString()
                    }
                } else {
                    let titleAspectName = this.item_aspect.attr.titleAspect || this.item_aspect.components[0].name
                    // condition hell should go if we apply json schema properly, this is all fallback stuff
                    if (!titleAspectName) {
                        console.log("json schema error. no titleAspectName in list with name ${this.aspect.name}")
                        return this.$_.fill([], "", 0, this.value.length)
                    }
                    for (let i = 0; i < titles.length; i++) {
                        if (!this.value[i]) {
                            console.log(`list no value! index:${i}`)
                            titles[i] = ""
                        } else {
                            if (!this.value[i].value[titleAspectName]) {
                                console.log(`list no component value! index:${i}, component:${titleAspectName}`)
                            } else {
                                titles[i] = this.value[i].value[titleAspectName].value
                            }
                        }
                    }
                }
                return titles
            },
            is_public() {
                if (this.aspect.attr.add_privacy === PUBLIC) {
                    return true
                } else {
                    return false
                }
            }
        }
    }
</script>

<style scoped>

  .inline {
    display: inline-block;
  }

  /**.panel_content {
    width: 98%;
    margin: auto;
  }*/
</style>
