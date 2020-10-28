<template lang="pug">
  div
    div(v-if="has_applied_filters")
      h4.mb-2 {{$t("comp.filterlist.appliead_filters")}}
      v-list.py-0(dense)
        v-scroll-x-transition(group)
          v-list-item(v-for="(filter, index) in visible_filter" :key="index")
            v-list-item-title {{$t(filter.t_label)}}:&nbsp;{{filter.text}}
            v-btn(fab x-small rounded elevation="2" @click="edit_filter(index)" :disabled="not_editable(filter)")
              v-icon mdi-filter
            v-btn(fab x-small rounded elevation="2" @click="remove_filter(index)" :disabled="not_removable(filter)")
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
      :ext_value="$_.get(active_filter, 'name') ? filter_value($_.get(active_filter, 'name')) : null"
      @update:ext_value="set_filter_value(active_filter.name, $event)")
</template>

<script>
import {aspect_default_value, value_text} from "~/lib/aspect"
import LayoutMixin from "~/components/global/LayoutMixin"
import AspectDialog from "~/components/dialogs/AspectDialog"
import {recursive_unpack2} from "~/lib/util"

export default {
  name: "Filterlist",
  mixins: [LayoutMixin],
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
      return this.$_.differenceBy(this.filter_options, this.applied_filters, f => f.name)
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
    }
  },
  methods: {
    filter_option_by_name(name) {
      return this.$_.find(this.filter_options, f => f.name === name)
    },
    available_filter_label(filter) {
      // console.log(filter)
      if (filter.t_label) {
        return this.$tc(filter.t_label)
      } else {
        console.log(filter)
        console.log("warning. filter should have t_label")
        return filter.name
      }
    },
    create_filter(name) {
      this.active_filter = Object.assign({}, this.filter_option_by_name(name))
      // console.log("active filter", this.active_filter)
      this.dialog_open = true
    },
    not_removable(filter) {
      if (filter.name === "template") {
        return true
      }
      return !this.$_.get(filter, "edit.removable", true)
    },
    not_editable(filter) {
      return !this.$_.get(filter, "edit.editable", true)
    },
    set_filter_value(name, value) {
      const new_value = recursive_unpack2(this.$_.cloneDeep(value))
      if (!new_value) {
        return
      }
      let text = value_text(this.active_filter.aspect, new_value)
      const new_filters = this.$_.cloneDeep(this.applied_filters)
      const existing_filter = new_filters.find(f => f.name === name)// && this.$_.get(f.source_name,"regular") === "regular")
      if (existing_filter) {
        existing_filter.value = new_value
        existing_filter.text = text
      } else {
        const new_filter = {
          "name": this.active_filter.name,
          "t_label": this.active_filter.t_label,
          "value": new_value,
          "text": text
        }
        if (this.active_filter.source_name) {
          new_filter.source_name = this.active_filter.source_name
        }
        new_filters.push(new_filter)
      }
      this.$emit("input", new_filters)
      // console.log("new filtervalue")
      this.dialog_open = false
    },
    edit_filter(index) {
      this.active_filter = Object.assign({}, this.filter_option_by_name(this.applied_filters[index].name))
      this.dialog_open = true
    },
    remove_filter(index) {
      this.$emit("input", this.$_.filter(this.value, (v, i) => i !== index))
    },
    filter_value(name) {
      // console.log("filter_value")
      const existing_filter = this.applied_filters.find(f => f.name === name)
      if (existing_filter) {
        return existing_filter.value
      } else {
        return aspect_default_value(this.filter_option_by_name(name).aspect)
      }
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
