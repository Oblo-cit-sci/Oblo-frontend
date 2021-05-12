<template lang="pug">
  div
    div(v-if="is_simple")
      div(v-for="(value, index) in value" :key="index")
        div.py-0(v-if="aspect_is_on_page(index)" :id="panel_id(index)")
          b.m-1(v-if="has_indexTitle") {{titles[index]|| index + 1}}
          span.float-left(v-if="text_only_item") - &nbsp;
          Aspect.py-0(
            v-bind="list_aspect_props(index)"
            @aspectAction="handleAspectAction($event, index)"
            @update:ext_value="update_index_value(index, $event)"
            v-on:append-outer="remove_value(index)")
          ListitemActions(
            v-if="!is_view_mode"
            v-bind="listitem_actions_prop(index)"
            @remove_value="remove_value($event)"
            v-on:move="move($event)")
      div(v-if="is_view_mode && is_empty")
        .ml-2 {{default_view_text}}
    div(v-else class="mb-1 mt-1")
      v-expansion-panels.complex_list_aspect(
        multiple
        v-model="panelState")
        v-expansion-panel(
          v-if="aspect_is_on_page(index)"
          v-for="(val, index) in value"
          :key="index"
          :id="panel_id(index)")
          v-expansion-panel-header {{titles[index] || index + 1}}
          v-expansion-panel-content
            Aspect(
              v-bind="list_aspect_props(index)"
              @aspectAction="handleAspectAction($event, index)")
            ListitemActions(v-if="!is_view_mode"
              v-bind="listitem_actions_prop(index)"
              v-on:remove_value="remove_value($event)"
              v-on:move="move($event)")
      div(v-if="is_view_mode && is_empty")
        .ml-2 {{aspect.attr.default_view_text}}
    MinMaxIndicators(
      v-if="!is_view_mode && !disabled"
      v-bind="min_max_props")
    .inline(v-if="adding_allowed && !fixed_length")
      v-btn(:disabled="!more_allowed" @click="add_value()" :color="requieres_more_color") {{$t('comp.list_asp.add', {'item_name': item_label})}}
        v-icon mdi-plus
    ListPagination(
      v-if="has_pagination"
      v-bind="pagination_props"
      @update:page="set_page($event, goto_panel_id($event))"
      @lastpage="more_follow_page = ($event)")
    .v-text-field__details
      .v-messages
</template>

<script>

import Aspect from "../Aspect";
import ListMixin from "../ListMixin";
import {COMPOSITE, EDIT, FLOAT, INDEX, INT, SELECT, SIMPLE_TYPE, STR, TREE} from "~/lib/consts";
import {
  aspect_loc_str,
  aspect_loc_str2arr,
  aspect_loc_uuid,
  aspect_raw_default_value,
  complete_aspect_loc,
  get_aspect_vue_component,
  pack_value,
  packed_aspect_default_value,
  remove_entry_loc
} from "~/lib/aspect";
import Paginate from "../global/Paginate";
import MinMaxIndicators from '../list_components/MinMaxIndicators'

import ListPagination from "../aspect_utils/ListPagination";
import goTo from 'vuetify/lib/services/goto'
import {recursive_unpack} from "~/lib/util";
import AspectComponentMixin from "./AspectComponentMixin";
import ListitemActions from "../aspect_utils/ListitemActions";

const SIMPLE = "simple"
const PANELS = "panels"


export default {
  name: "ListAspect",
  components: {ListitemActions, ListPagination, Paginate, Aspect, MinMaxIndicators},
  mixins: [AspectComponentMixin, ListMixin],
  data() {
    return {
      item_aspect: null,
      structure: null,
      count: true,
      // for composite
      panelState: [],
      select: false, // select... instead of button
      options: [],
      new_edit: [],
      // when switching between entries on one page (map), the list should collapse
      uuid_cache: null
    }
  },
  created() {
    this.uuid_cache = this.entry_uuid
    //console.log("LA created", this.value)
    // todo. list, are extended lists by user, not select lists
    // todo the item should not be just a string, DEPRECATED
    //console.log("object type", this.aspect.list_items)
    this.item_aspect = this.aspect.list_items
    if (this.item_aspect.type === "composite" || this.attr.force_panels) {
      this.structure = PANELS
      // get the titles // should cause having the panel titles when entry is entered
      // fill in the values of the titleAspect
    } else {
      this.structure = SIMPLE;
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
    if (this.value && this.value.length === 0) {
      for (let i = 0; i < this.attr.create || 0; i++) {
        this.add_value()
      }
    }
    const entry = this.get_entry()
    if (entry && this.$_.get(entry, "local.list_pages")) {
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
      // console.log("add")
      let additional = []
      //console.log("list has length", this.value)
      for (let i = 0; i < n; i++) {
        additional.push(packed_aspect_default_value(this.item_aspect))
      }
      this.update_value(this.$_.concat(this.value, additional))
      if (n === 1) {
        // this.has_one_empty = true
        this.goto_delayed_last_page(this.goto_panel_id())
        setTimeout(() => {
          if (!this.is_simple) {
            this.panelState = [(this.value.length + this.pagination_tresh - 1) % this.pagination_tresh]
          }
        }, 20)
      }
      // console.log(this.value)
      this.new_edit.push(this.value.length)
    },
    list_aspect_props(index) {
      const data = {
        aspect: this.indexed_item_aspect(index),
        mode: this.$_.includes(this.new_edit, index) ? EDIT : this.mode,
        extra: this.list_extra(index)
      }

      if (this.aspect_loc) {
        data.aspect_loc = this.item_aspect_loc(index)
      } else {
        data.ext_value = this.value[index]
      }
      return data
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
      // todo something like this could be in a mixin (used by others as well)
      this.update_value(this.$_.filter(this.value, (val, i) => {
        return index !== i
      }))
      if (this.structure === PANELS) {
        this.panelState = []
      }
      this.guarantee_page()
    },
    move(index_direction) {
      const index = index_direction[0]
      const direction = index_direction[1]
      const to_move = this.value[index]
      const without = this.$_.filter(this.value, (e, i) => i !== index)
      const new_left = this.$_.take(without, index + direction)
      const new_right = this.$_.takeRight(without, without.length - (index + direction))
      this.update_value(this.$_.concat(new_left, to_move, new_right))
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
      return this.$_.concat(this.aspect_loc, [[INDEX, index, this.item_aspect.name]])
    },
    indexed_item_aspect(index) {
      let aspect = {...this.item_aspect}
      aspect.name = "" + (index + 1)
      return aspect
    },
    handleAspectAction(event, index) {
      // console.log("aspect-action", event)
      if (event.action === "clear") {
        this.remove_value(index)
      } else
        this.$emit("aspectAction", event)
    },
    list_extra(index) {
      const extra = Object.assign({
        no_title: this.attr.hasOwnProperty("no_titles") ? this.attr.no_titles : true,
        clear: false,
        listitem: true,
        list_index: index
      }, this.extra)
      if (extra.hasOwnProperty("ref_length")) {
        delete extra.ref_length
      }
      return extra
    },
    panel_id(index) {
      return "L-" + aspect_loc_str(this.$_.slice(this.$_.concat(this.aspect_loc, [[INDEX, index]]), 1))
    },
    index_on_act_page(index) {
      return index >= this.page * this.pagination_tresh && index < (this.page + 1) * this.pagination_tresh
    },
    goto_panel_id(page = this.page) {
      return this.is_simple ? undefined : this.panel_id(parseInt(page * this.pagination_tresh))
    },
    update_index_value(index, value) {
      const cp = this.$_.cloneDeep(this.value)
      cp[index] = value
      this.update_value(cp)
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
      return this.attr.moveable || false
    },
    requires_delete() {
      let itemtype = this.item_aspect.type
      return !(itemtype === "str" || itemtype === "int" || itemtype === "float" || itemtype === "tree")
    },
    text_only_item() {
      if (this.item_aspect.type === TREE) {
        const list_values = this.value
        const has_icon = this.$_.some(list_values.map(lv => (
          this.$_.some(lv.value, vi => vi.icon !== undefined)
        )))
        if (has_icon) {
          return false
        }
      }
      return [STR, INT, FLOAT, SELECT].includes(this.item_aspect.type)
    },
    default_view_text() {
      return this.$_.get(this.attr, "default_view_text", "")
    },
    titles() {
      let titles = new Array(this.value.length)
      let titleAspectName = this.get_attr(this.item_aspect).titleComponent
      let simple_type = SIMPLE_TYPE.includes(this.item_aspect.type)
      let item_name = this.item_label

      if (!simple_type && !titleAspectName && this.item_aspect.type === COMPOSITE) {
        titleAspectName = [this.item_aspect.components[0].name]
        if (!item_name) {
          item_name = titleAspectName
        }
      }
      // condition hell should go if we apply json schema properly, this is all fallback stuff
      if (!(simple_type || titleAspectName)) {
        console.log(`json schema error. no simple aspect or titleAspectName in list with name ${this.aspect.name}`)
        return this.$_.fill([], "", 0, this.value.length)
      }
      for (let i = 0; i < titles.length; i++) {
        // debugger
        if (!this.value[i]) {
          console.log(`list no value! index:${i}`)
          titles[i] = ""
        } else {
          // todo does not need to be a method?
          const index_name = item_name + " " + (parseInt(i) + 1).toString()
          if (simple_type && !this.attr.indexTitle) {
            titles[i] = this.value[i].value
          } else if (this.attr.indexTitle) {
            titles[i] = index_name
          } else if (titleAspectName) { // its a list
            if (!Array.isArray(titleAspectName)) {
              titleAspectName = [titleAspectName]
            }
            for (let titleAspectName_ of titleAspectName) {
              let value = this.value[i].value[titleAspectName_]
              if (value.value) {
                // treeselect -> [[value,text],[value,text],...]
                if (Array.isArray(value.value)) {
                  if (this.$_.isEmpty(value.value)) {
                    titles[i] = ""
                    break
                  }
                  value = this.$_.last(value.value)
                }
                if (value.text) {
                  titles[i] = value.text
                } else {
                  titles[i] = value.value
                }
                break
              }
            }
          }
          if (titles[i] === "" || titles[i] === null) {
            titles[i] = index_name
          }
        }
      }
      return titles
    },
    adding_allowed() {
      if (this.is_editable_mode) {
        return true
      } else {
        return this.is_public
      }
    },
    is_public() {
      return this.attr.add_privacy || false
    },
    has_indexTitle() {
      return this.attr.indexTitle || false
    },
    min_max_props() {
      return {
        aspect: this.aspect,
        length: this.value.length,
        min: this.min,
        max: this.max
      }
    },
    is_empty() {
      return this.value.length === 0
    }
  },
  beforeUpdate() {
    if (this.uuid_cache && this.uuid_cache !== this.entry_uuid) {

      this.uuid_cache = this.entry_uuid
      this.panelState = []
    }
  }
}
</script>

<style scoped>

.inline {
  display: inline-block;
}

</style>
