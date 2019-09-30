<template lang="pug">
  div
    div(v-if="is_simple")
      div(v-for="(value, index) in i_value" :key="index")
        Aspect(
          :aspect="indexed_item_aspect(index)"
          :value.sync="i_value[index]"
          :edit="true"
          :mode="mode"
          :aspect_loc="item_aspect_loc(index)"
          :extra="list_extra(index)"
          v-on:entryAction="handleEntryAction($event, index)")
          v-on:append-outer="remove_value(index)"
        ListitemActions(
          :requires_delete="requires_delete"
          :itemname="extra.itemname"
          :moveable="moveable"
          :index="index"
          :listlength="i_value.length - 1"
          v-on:remove_value="remove_value($event)"
          v-on:move="move($event)")
    div(v-else)
      v-expansion-panel(
        expand
        v-model="panelState")
        v-expansion-panel-content(
          v-for="(value, index) in i_value"
          :key="index"
          :id="panel_id(index)"
        )
          template(v-slot:header)
            div {{titles[index]|| index + 1}}
          Aspect(
            :aspect="indexed_item_aspect(index)"
            :value.sync="i_value"
            :mode="mode"
            :extra="list_extra(index)"
            :aspect_loc="item_aspect_loc(index)"
            v-on:entryAction="$emit('entryAction',$event)")
          ListitemActions(
            :requires_delete="requires_delete"
            :itemname="extra.itemname"
            :moveable="moveable"
            :index="index"
            :listlength="i_value.length - 1"
            v-on:remove_value="remove_value($event)"
            v-on:move="move($event)")
    div
      span {{count_text}}, &nbsp
      span(v-if="min===max && min !== null") required: {{min}}
      span(v-else)
        span(v-if="min") min: {{min}} &nbsp;
        span(v-if="max") max: {{max}}

    div(v-if="!readOnly && !fixed_length")
      v-btn(:disabled="!more_allowed" @click="add_value()" :color="requieres_more_color") Add {{item_name}}
        v-icon(right) add
</template>

<script>

    import AspectMixin from "./AspectMixin";
    import {get_codes_as_options} from "../../lib/client";
    import Aspect from "../Aspect";
    import ListMixin from "../ListMixin";
    import {INDEX, TITLE_UPDATE} from "../../lib/consts";
    import {aspect_loc_str, packed_aspect_default_value, get_aspect_component} from "../../lib/aspect";
    import ListitemActions from "../ListitemActions";


    // todo, pass the extra in a more intelligent way down, not to all the same

    const SIMPLE = "simple"
    const PANELS = "panels"

    export default {
        name: "ListAspect",
        components: {ListitemActions, Aspect},
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
            }
        },
        created() {
            //console.log("LA created")
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
                    required: true
                }
            } else if (typeof (item_type) === "object") {
                // console.log("object type", this.aspect.items)
                if (this.aspect.items.type === "composite") {
                    this.item_aspect = this.aspect.items;
                    this.item_aspect.required = true;
                    this.structure = PANELS
                    // fill in the values of the titleAspect
                    for (let item_index in this.i_value) {
                        this.panelState.push(false)
                    }
                } else {
                    this.item_aspect = this.aspect.items;
                    this.structure = "simple";
                }
            }
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
                this.$_.fill(this.panelState, false)
                this.min = this.extra.ref_length
                this.max = this.extra.ref_length
            }
            this.set_min_max()
            if (this.i_value.length === 0) {
                for (let i = 0; i < this.aspect.attr.create || 0; i++) {
                    this.add_value()
                }
            }
        },
        methods: {
            clearableAspectComponent(aspect) {
                return get_aspect_component(aspect, this.mode)
            },
            add_value(n = 1) {
                let additional = []
                this.$_.fill(this.panelState, false)
                for (let i = 0; i < n; i++) {
                    additional.push(packed_aspect_default_value(this.item_aspect))
                    if (this.structure === PANELS) {
                        this.panelState.push(true)
                    }
                }
                this.value_change(this.$_.concat(this.i_value, additional))
                // we need this, otherwise the list wont update (if its not composite)
                // added to Aspect component...
                setTimeout(() => {
                    this.i_value = this.value
                }, 50)

                //console.log("ADDING")
                //console.log(this.value)

            },
            remove_value(index) {
                console.log("remove_value")
                this.value_change(this.$_.filter(this.i_value, (val, i) => {
                    return index !== i
                }))
                if (this.structure === PANELS) {
                    this.panelState.splice(index, 1)
                }
            },
            move(index_direction) {
                const index = index_direction[0]
                const direction= index_direction[1]
                console.log("move", index, direction)
                const to_move = this.i_value[index]
                const without = this.$_.filter(this.i_value, (e, i) => i !== index)
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
                let xtra_copy = JSON.parse(JSON.stringify(this.extra))
                xtra_copy.no_title = false
                xtra_copy.clear = "no_title"
                xtra_copy.listitem = true
                xtra_copy.list_index = index
                return xtra_copy
            },
            panel_id(index) {
                return "L-" + aspect_loc_str(this.$_.concat(this.aspect_loc, [[INDEX, index]]))
            },
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
            count_text() {
                const le = this.i_value.length
                const attr = this.aspect.attr
                const name = attr.itemname || "item"
                const item_word = le === 1 ? name :
                    (attr.itemname_plural || name + "s")
                return +le + " " + item_word
            },
            requires_delete() {
                let itemtype = this.aspect.items.type
                return !(itemtype === "str" || itemtype === "int" || itemtype === "float");
            },
            titles() {
                let titles = new Array(this.i_value.length)
                if (this.aspect.attr.indexTitle) {
                    for (let i = 0; i < titles.length; i++) {
                        titles[i] = this.aspect.attr.itemname + " " + (parseInt(i) + 1).toString()
                    }
                } else {
                    let titleAspectName = this.item_aspect.attr.titleAspect || this.item_aspect.components[0].name
                    for (let i = 0; i < titles.length; i++) {
                        titles[i] = this.i_value[i].value[titleAspectName].value
                    }
                }
                return titles
            }
        }
    }
</script>

<style scoped>

  .panel_content {
    width: 98%;
    margin: auto;
  }
</style>
