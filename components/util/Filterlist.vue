<template lang="pug">
  div
    div(v-if="has_applied_filters")
      h4.mb-2 {{$t("comp.filterlist.appliead_filters")}}
      v-list.py-0(dense)
        v-scroll-x-transition(group)
          v-list-item.pl-1.pr-0(v-for="(filter, index) in visible_filter" :key="index")
            v-list-item-title {{applied_filter_text(filter)}}
            v-btn(fab x-small rounded elevation="2" @click="edit_filter(index)"
              :disabled="not_editable(filter)" :style="filter_edit_button_style(filter)")
              v-icon mdi-filter
            v-btn(fab x-small rounded elevation="2" @click="remove_filter(filter)"
              :disabled="not_removable(filter)" :style="filter_remove_button_style(filter)")
              v-icon mdi-window-close
    v-menu
      template(v-slot:activator="{ on: menu }")
        v-btn.mt-0(v-on="{...menu}" :disabled="no_available_filters" small) {{$t("comp.filterlist.btn_add_filter")}}
          v-icon mdi-plus
      v-list
        v-list-item(v-for="filter in available_filter"
          :key="filter.name"
          @click="create_filter(filter.name)")
          v-list-item-title {{available_filter_label(filter)}}
    <!--    v-btn.mt-4(v-if="filter_changed" :color="filter_changed ? 'success' : ''" @click="$emit('search')") {{$t('w.search')}}-->
    AspectDialog(
      :dialog_open.sync="dialog_open"
      :show_aspect="active_filter !== null"
      :aspect="$_.get(active_filter, 'aspect', dummy_aspect)"
      :conditionals="value"
      mode="edit"
      :ext_value="active_filter_value"
      @update:ext_value="set_filter_value(active_filter.name, $event)")
</template>

<script>
import {aspect_default_value, pack_value} from "~/lib/aspect"
import LayoutMixin from "~/components/global/LayoutMixin"
import AspectDialog from "~/components/dialogs/AspectDialog"
import FilterMixin from "~/components/FilterMixin";
import SelectComponentMixin from "~/components/aspect_utils/SelectComponentMixin";

/**
 * refactor the whole thing, so that the check of if there is an aspect is required (for requires_review filter)
 */
export default {
  name: "Filterlist",
  mixins: [LayoutMixin, FilterMixin, SelectComponentMixin],
  components: {AspectDialog},
  props: {
    filter_options: Array,
    value: Array,
    filter_changed: Boolean
  },
  data() {
    return {
      dialog_open: false,
      active_filter: null,
      dummy_aspect: {
        name: "dummy-aspect",
        type: "str",
        attr: {}
      }
    }
  },
  computed: {
    available_filter() {
      // console.log("applied", this.applied_filters)
      // allow_multiple pass here, but are checked against their option in the value
      let available_filters = this.$_.cloneDeep(this.filter_options)
      let keep = this.$_.remove(available_filters, filter => filter.allow_multiple)
      // console.log("keep", keep)
      // console.log("av",available_filters)
      available_filters = this.$_.differenceBy(available_filters, this.applied_filters, f => f.name)
      // console.log("av--",available_filters)
      return this.$_.concat(keep, available_filters)
    },
    has_applied_filters() {
      return this.applied_filters.length > 0
    },
    applied_filters() {
      return this.value
    },
    visible_filter() {
      return this.applied_filters.filter(f => this.$_.get(f, "edit.visible", true))
    },
    no_available_filters() {
      return this.available_filter.length === 0
    },
    active_filter_value() {
      // console.log(this.active_filter)
      if (this.active_filter?.allow_multiple) {
        return pack_value(null)
      }
      const existing = this.$_.get(this.active_filter, 'name') ? this.filter_value(this.$_.get(this.active_filter, 'name')) : null
      // console.log("existing", existing)
      return existing
    }
  },
  methods: {
    filter_option_by_name(name) {
      return this.$_.find(this.filter_options, f => f.name === name)
    },
    filter_text(filter) {
      // console.log(filter.value)
      // todo fix how text is stored for location-agregate marker
      if (filter.text) {
        console.warn("filter-text is filter not in filter.value, ...")
        return filter.text
      }
      // console.log("vv", filter.value.value)
      // console.log(filter.value.value.map(v => v.text).join(", "))
      return filter.value.map(v => v.text).join(", ")
    },
    available_filter_label(filter) {
      if (filter.t_label) {
        return this.$tc(filter.t_label)
      } else {
        return filter.name
      }
    },
    create_filter(name) {
      const selected_filter = this.filter_option_by_name(name)
      // console.log(selected_filter)
      this.active_filter = Object.assign({}, selected_filter)
      if (selected_filter.aspect) {
        // console.log("active filter", this.active_filter)
        this.dialog_open = true
      } else {
        this.set_filter_value(selected_filter.name, selected_filter.value)
      }
    },
    not_removable(filter) {
      if (this.$_.get(this.filter_option_by_name(filter.name), "aspect.attr.min") > 0) {
        return true
      }
      return !this.$_.get(filter, "edit.removable", true)
    },
    not_editable(filter) {
      return !this.$_.get(filter, "edit.editable", true)
    },
    filter_edit_button_style(filter) {
      if (this.not_editable(filter)) {
        return {
          opacity: 0
        }
      }
    },
    filter_remove_button_style(filter) {
      if (this.not_removable(filter)) {
        return {
          opacity: 0
        }
      }
    },
    set_filter_value(name, value) {
      const new_filters = this.$_.cloneDeep(this.applied_filters)
      const existing_filter = new_filters.find(f => f.name === name)// && this.$_.get(f.source_name,"regular") === "regular")
      if (existing_filter) {
        // allow just once in the list
        if (!this.filter_option_by_name(existing_filter.name).allow_multiple) {
          existing_filter.value = value
          this.$emit("input", new_filters)
          return
        }
        if (existing_filter.value.option === value.option) {
          existing_filter.value = value
          this.$emit("input", new_filters)
          return
        }
      }
      const new_filter = {
        "name": this.active_filter.name,
        "t_label": this.active_filter.t_label,
        "value": value
      }
      if (this.active_filter.edit) {
        new_filter.edit = this.active_filter.edit
      }
      if (this.active_filter.source_name) {
        new_filter.source_name = this.active_filter.source_name
      }
      new_filters.push(new_filter)
      this.$emit("input", new_filters)
      this.dialog_open = false
    },
    edit_filter(index) {
      this.active_filter = Object.assign({}, this.filter_option_by_name(this.applied_filters[index].name))
      this.dialog_open = true
    },
    remove_filter(filter) {
      // console.log(this.value, filter)
      this.$emit("input", this.$_.filter(this.value, (v) => !this.$_.isEqual(v, filter)))
    },
    filter_value(name) {
      const existing_filter = this.applied_filters.find(f => f.name === name)
      if (existing_filter) {
        return existing_filter.value
      } else {
        if (this.filter_option_by_name(name).aspect) {
          return aspect_default_value(this.filter_option_by_name(name).aspect)
        }
      }
    },
    applied_filter_text(filter) {
      const filter_value_text = this.filter_text(filter)
      if(filter_value_text !== "") {
        return `${this.$t(filter.t_label)}: ${filter_value_text}`
      } else
        return this.$t(filter.t_label)
    }
  },
  watch: {
    // this catches the problem, that if selection is cancelled (clicking outside)
    // the aspect is not deleted, and the options wont change, when another filter is selected
    dialog_open(val) {
      if (val === false) {
        setTimeout(() => {
          this.active_filter = null
        }, 100)
      }
    }
  }
}
</script>

<style scoped>

</style>
