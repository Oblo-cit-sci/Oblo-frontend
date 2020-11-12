<template lang="pug">
  div(v-if="!is_view_mode")
    v-list(v-if="list_view")
      <!-- mandatory does only check if min > 1 -->
      v-list-item-group(v-model="selection_index" multiple active-class="in_selection" :mandatory="mandatory" :max="max_vals")
        v-list-item(v-for="option in options" :key="option.value" :disabled="option_disabled(option)")
          template(v-slot:default="{ active }")
            v-list-item-content {{option.text}}
            v-list-item-action
              v-checkbox( color="khaki" :input-value="active" readonly)
    v-select(v-else
    :items="options"
      v-model="selection"
      :readonly="is_view_mode"
      :hide-details="!count_rules"
      :rules="count_rules"
      @blur="menu_open = !menu_open"
      background-color="khaki"
      :menu-props="{openOnClick:menu_open, offsetY: true}"
      @click="menu_open = !menu_open"
      @update:error="$emit('update:error', $event)"
      single-line outlined chips multiple clearable)
  div(v-else)
    v-chip(
      v-for="(item, index) in selection" :key="index"
      class="mr-2 mt-2 mb-4"
    )
      span {{item.text}}
</template>

<script>
import SelectMixin from "./SelectMixin";
import AspectComponentMixin from "./AspectComponentMixin";

// maybe also for v-select:
// :prepend-inner-icon="!menu_open ? 'mdi-check' : ''"
export default {
  name: "MultiSelectAspect",
  mixins: [AspectComponentMixin, SelectMixin],
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
      return this.edit_view === "list"
    },
    select_view() {
      return this.edit_view === "select"
    },
    selection_index: {
      get() {
        if (this.value) {
          return this.value.map(v => this.options.findIndex(o => o.value === v))
        }
      },
      set(val) {
        this.update_value(this.$_.filter(this.options, (o, i) => val.includes(i)).map(v => v.value))
      }
    },
    mandatory() {
      return this.$_.get(this.aspect, "attr.min",0) > 0
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
    }
  },
  methods: {
    set_selection() {
      // console.log("this.value", this.value)
      if (this.value) {
        this.selection = this.$_.filter(this.options, (o) => {
          return this.value.indexOf(o.value) > -1
        })
      } else {
        this.init = false
      }
    },
    toString(value) {
      return value.join(", ") || ""
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
    // item_style(option) {
    //   console.log(option.value, this.option_disabled(option))
    //   	return {
    //   	  "background": this.option_disabled(option) ? "#C0C0C0" : ""
    //     }
    // }
  },
  watch: {
    selection() {
      //console.log("multi-select", this.selection, this.init)
      if (this.init) {
        this.init = false
        return
      }
      if (this.selection === null)
        this.update_value(null)
      else {
        this.update_value(this.selection)
      }
    }
  }
}
</script>

<style scoped>

</style>
