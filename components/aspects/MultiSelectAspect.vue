<template lang="pug">
  div(v-if="!is_view_mode")
    v-list(v-if="list_view")
      v-list-item-group(v-model="selection_index" multiple active-class="in_selection")
        v-list-item(v-for="option in options" :key="option.value")
          template(v-slot:default="{ active, toggle }")
            v-list-item-content {{option.text}}
            v-list-item-action
              v-checkbox(:input-value="active"
                color="khaki"
                @click="toggle")
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
        if (this.aspect.attr.force_view) {
          const view = this.aspect.attr.force_view
          if (["list", "select"].includes(view)) {
            return view
          }
        }
        const list_thresh = this.aspect.attr.list_tresh || 5
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
      count_rules() {
        const rules = []
        if (this.aspect.attr.min) {
          const rule = (v) => v && v.length >= this.aspect.attr.min || this.$t("comp.multiselect_asp.min_rule")
          rules.push(rule)
        }
        if (this.aspect.attr.max) {
          const rule = (v) => v && v.length <= this.aspect.attr.max || this.$t("comp.multiselect_asp.max_rule")
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
      }
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
