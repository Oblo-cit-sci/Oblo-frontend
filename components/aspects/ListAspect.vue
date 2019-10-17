<template lang="pug">
  div
    div(v-if="is_simple")
      div(v-for="(value, index) in value" :key="index")
        div(v-if="aspect_is_on_page(index)" :id="panel_id(index)")
          Aspect(
            :aspect="indexed_item_aspect(index)"
            :value.sync="value"
            :edit="true"
            :mode="mode"
            :aspect_loc="item_aspect_loc(index)"
            :extra="list_extra(index)"
            v-on:entryAction="handleEntryAction($event, index)"
            v-on:append-outer="remove_value(index)")
          ListitemActions(
            v-if="!readOnly"
            :requires_delete="requires_delete"
            :itemname="extra.itemname"
            :moveable="moveable"
            :index="index"
            :listlength="value.length - 1"
            v-on:remove_value="remove_value($event)"
            v-on:move="move($event)")
    div(v-else class="mb-4 mt-4")
      v-expansion-panels(
        multiple
        v-model="act_panel_state")
        v-expansion-panel(
          v-if="aspect_is_on_page(index)"
          v-for="(value, index) in value"
          :key="index"
          :id="panel_id(index)"
        )
          v-expansion-panel-header {{titles[index]|| index + 1}}
          v-expansion-panel-content
            Aspect(
              :aspect="indexed_item_aspect(index)"
              :mode="mode"
              :extra="list_extra(index)"
              :aspect_loc="item_aspect_loc(index)"
              v-on:entryAction="$emit('entryAction',$event)")
            ListitemActions(v-if="!readOnly"
              :requires_delete="requires_delete && !fixed_length"
              :itemname="extra.itemname"
              :moveable="moveable"
              :index="index"
              :listlength="value.length - 1"
              v-on:remove_value="remove_value($event)"
              v-on:move="move($event)")
    MinMaxIndicators(
      v-if="!readOnly"
      :aspect="aspect"
      :length="this.value.length"
      :min="this.min"
      :max="this.max")

    div(v-if="!readOnly && !fixed_length")
      v-btn(:disabled="!more_allowed" @click="add_value()" :color="requieres_more_color") Add {{item_name}}
        v-icon(right) add
      ListPagination(
        v-if="has_pagination"
        :total="Math.ceil(value.length / PAGINATION_TRESH)"
        :page="page"
        :pages="pages"
        :allow_jump="allow_jump"
        :default_next_page_text="default_next_page_text"
        :default_prev_page_text="default_prev_page_text"
        @update:page="set_page($event)"
        @lastpage="more_follow_page = ($event)")
      .v-text-field__details
        .v-messages
</template>

<script>

    import AspectMixin from "./AspectMixin";
    import Aspect from "../Aspect";
    import ListMixin from "../ListMixin";
    import {INDEX} from "../../lib/consts";
    import {aspect_loc_str, packed_aspect_default_value, get_aspect_vue_component} from "../../lib/aspect";
    import ListitemActions from "../ListitemActions";
    import Paginate from "../Paginate";
    import goTo from 'vuetify/lib/services/goto'
    import MinMaxIndicators from '../list_components/MinMaxIndicators'

    import ListPagination from "../ListPagination";
    import {get_codes_as_options} from "../../lib/options";

    const SIMPLE = "simple"
    const PANELS = "panels"

    const PAGINATION_TRESH = 3

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
                //
                page: 0,
                allow_jump: false,
                default_next_page_text: ">",
                default_prev_page_text: "<",
                PAGINATION_TRESH: PAGINATION_TRESH
            }
        },
        created() {          
            //console.log("LA created", this.value)
            let item_type = this.aspect.items;
            // todo. list, are extended lists by user, not select lists
            if (typeof (item_type) === "string") {
                if (item_type[0] === "*") {
                    this.select = true
                    //console.log("list multi-select", item_type)
                    this.options = get_codes_as_options(this.$store.state, item_type)
                } else {
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
                    // fill in the values of the titleAspect
                } else {
                    this.item_aspect = this.aspect.items;
                    this.structure = "simple";
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
        },
        methods: {
            clearableAspectComponent(aspect) {
                return get_aspect_vue_component(aspect, this.mode)
            },
            aspect_is_on_page(index) {
                return index >= this.page * PAGINATION_TRESH && index < (this.page + 1) * PAGINATION_TRESH
            },
            set_page(page) {
                this.page = page
                try {
                    const item_no = parseInt(page * PAGINATION_TRESH)
                    setTimeout(() => {
                        goTo("#" + this.panel_id(item_no), {
                            duration: 200,
                            easing: "easeOutCubic"
                        })
                    }, 50)
                } catch (e) {
                    console.log(e)
                }
            },
            add_value(n = 1) {
                let additional = []
                for (let i = 0; i < n; i++) {
                    additional.push(packed_aspect_default_value(this.item_aspect))
                    if (this.structure === PANELS) {
                        this.panelState = [this.value.length]
                    }
                }
                this.value_change(this.$_.concat(this.value, additional))

                setTimeout(() => {
                    this.set_page(this.pages.length - 1)
                }, 50)

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
                    this.$_.fill(this.panelState, false)
                    //this.panelState[index+direction] = true
                }
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
                return index >= this.page * PAGINATION_TRESH && index < (this.page + 1) * PAGINATION_TRESH
            }
        },
        computed: {
            has_pagination() {
                return this.value.length > PAGINATION_TRESH || this.aspect.attr.pagination
            },
            pages() {
                let pages = []
                for (let i = 0; i < this.value.length / PAGINATION_TRESH; i++) {
                    pages.push({})
                }
                return pages
            },
            act_panel_state: {
                get() {
                    return this.$_.filter(this.panelState, (e, index) => this.index_on_act_page(index))
                },
                set(val) {} // we need this, or vue warns...
            },
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
                    for (let i = 0; i < titles.length; i++) {
                        titles[i] = this.value[i].value[titleAspectName].value
                    }
                }
                return titles
            }
        }
    }
</script>

<style scoped>

  /**.panel_content {
    width: 98%;
    margin: auto;
  }*/
</style>
