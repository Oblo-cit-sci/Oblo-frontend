<template lang="pug">
  div(v-if="is_editable_mode")
    v-list(v-if="list_view")
      <!-- mandatory does only check if min > 1 -->
      v-list-item-group(v-model="selection_index" multiple active-class="in_selection" :mandatory="mandatory" :max="max_vals")
        v-list-item(v-for="(option,index) in computed_list_options" :key="index" :disabled="option_disabled(option)")
          template(v-slot:default="{ active }")
            v-list-item-content {{option.text}}
            v-list-item-action
              v-checkbox( color="khaki" :input-value="active" readonly)
    v-select(v-else
    :items="options"
      v-model="select_items"
      :readonly="is_view_mode"
      :hide-details="!count_rules"
      :rules="count_rules"
      @focus="menu_open = !menu_open"
      background-color="khaki"
      :menu-props="{openOnClick:menu_open, offsetY: true}"
      @click="menu_open = !menu_open"
      @update:error="$emit('update:error', $event)"
      single-line outlined chips multiple clearable)
  div(v-else)
    p.body-1.readonly-aspect.break_word
      div(v-for="s in selection || []") - &nbsp;{{s.text}}
</template>

<script>
import SelectMixin from "./SelectMixin";
import AspectComponentMixin from "./AspectComponentMixin";
import ResponsivenessMixin from "~/components/ResponsivenessMixin";

// maybe also for v-select:
// :prepend-inner-icon="!menu_open ? 'mdi-check' : ''"
/**
 * TODO: edge case, see pages/test/extra/SelectOptionsFromSource.vue
 * when a source value is changing, it behaves weird...
 */
export default {
  name: "MultiSelectAspect",
  mixins: [AspectComponentMixin, SelectMixin, ResponsivenessMixin],
  data() {
    return {
      init: true,
      menu_open: false,
    }
  },
  created() {
    this.set_selection()
  },
  computed: {
    edit_view() {
      if (this.attr.force_view) {
        const view = this.attr.force_view
        if (["list", "select"].includes(view)) {
          return view
        }
      }
      const list_thresh = this.attr.list_tresh || 5
      if (this.options.length <= list_thresh) {
        return "list"
      } else {
        return "select"
      }
    },
    list_view() {
      return this.edit_view === "list" || this.is_xsmall
    },
    select_view() {
      return this.edit_view === "select"
    },
    selection_index: {
      get() {
        // console.log("get selection_index", this.value)
        if (this.value) {
          return this.value.map(v => this.computed_list_options.findIndex(o => o.value === v.value))
        }
      },
      set(val) {
        // console.log("MultiSelectAspect.set__selection_index", val)
        const selection = this.$_.filter(this.computed_list_options, (o, i) => val.includes(i))
        // console.log(selection)
        this.update_value(selection)
      }
    },
    mandatory() {
      return this.$_.get(this.aspect, "attr.min", 0) > 0
    },
    max_vals() {
      return this.$_.get(this.aspect, "attr.max")
    },
    count_rules() {
      const rules = []
      if (this.attr.min) {
        const rule = (v) => v && v.length >= this.attr.min || this.$t("comp.multiselect_asp.min_rule")
        rules.push(rule)
      }
      if (this.attr.max) {
        const rule = (v) => v && v.length <= this.attr.max || this.$t("comp.multiselect_asp.max_rule")
        rules.push(rule)
      }
      return rules
    },
    view_text() {
      return this.selection.map(s => s.text).join("\r\n- ")
    },
    select_items: {
      get() {
        if (this.value) {
          const values_only = this.$_.map(this.value, "value")
          const options_values =  this.$_.map(this.computed_list_options, "value")
          return this.$_.filter(options_values, o => values_only.includes(o))
        }
      },
      set(value) {
        const selection = value.map(v => this.computed_list_options.find(o => o.value === v))
        // console.log("set", value, selection)
        this.update_value(selection)
      }
    }
  },
  methods: {
    set_selection() {
      // console.log("MultiSelectAspect.set_selection", this.value)
      // console.log("this.value", this.value)
      if (this.value) {
        const values = this.value.map(v => v.value)
        this.selection = this.$_.filter(this.computed_list_options, (o) => {
          return values.indexOf(o.value) > -1
        })
      } else {
        this.init = false
        // this.selection = []
      }
    },
    option_disabled(option) {
      if (option.condition) {
        if (option.condition.exclude) {
          const cond_failed = this.$_.some(this.value, v => option.condition.exclude.includes(v))
          if (cond_failed) {
            if (this.value.includes(option.value)) {
              this.update_value(this.$_.filter(this.value, v => v !== option.value))
            }
          }
          return cond_failed
        }
      }
      return false
    }
  },
  watch: {
    selection() {
      // console.log("MultiSelectAspect.watch__selection", this.selection, this.init)
      if (this.init) {
        this.init = false
        return
      }
      if (this.selection === null)
        this.update_value([])
      else {
        if (this.selection !== this.value) {
          // console.log(this.selection.map(s => s.value), this.value)
          // console.log(this.$_.isEqual(this.selection.map(s => s.value), this.value))
          // console.log("selection", this.selection, this.value)
          if (!this.$_.isEqual(this.selection, this.value))
            this.update_value(this.selection)
        }
      }
    },
    value(value) {
      // console.log("MultiSelectAspect.watch__value", value)
      this.set_selection()
    }
  }
}
</script>

<style scoped>

</style>
