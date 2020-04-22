<template lang="pug">
  div
    div(v-if="has_applied_filters")
      h4 Applied filters
      v-list
        v-list-item(v-for="(filter, index) in applied_filters" :key="filter.name")
          v-list-item-title {{filter.label}}:&nbsp;{{filter.text}}
          v-list-item-icon
            v-btn(icon @click="edit_filter(index)")
              v-icon mdi-filter
          v-list-item-icon
            v-btn(icon @click="remove_filter(index)")
              v-icon mdi-window-close
    v-menu
      template(v-slot:activator="{ on: menu }")
        v-btn(v-on="{...menu}") add filter
          v-icon mdi-plus
      v-list
        v-list-item(v-for="filter in available_filter"
          :key="filter.name"
          @click="create_filter(filter.name)")
          v-list-item-title {{filter.label}}
    v-dialog(v-model="dialog_open")
      div.pl-2.pt-3(style="background:white")
        Aspect(v-if="active_filter"
          :aspect="active_filter.aspect"
          mode="edit"
          :ext_value="filter_value(active_filter.name)"
          @update:ext_value="set_filter_value(active_filter.name, $event)")
</template>

<script>
  import FilterSelect from "~/components/FilterSelect"
  import Aspect from "~/components/Aspect"
  import {aspect_default_value} from "~/lib/aspect"
  import {SELECT} from "~/lib/consts"

  export default {
    name: "Filterlist",
    mixins: [],
    components: {Aspect, FilterSelect},
    props: {
      filter_options: Array
    },
    data() {
      return {
        applied_filters: [],
        dialog_open: false,
        active_filter: null
      }
    },
    computed: {
      available_filter() {
        return this.filter_options
      },
      has_applied_filters() {
        return this.applied_filters.length > 0
      }
    },
    methods: {
      filter_option_by_name(name) {
        return this.$_.find(this.filter_options, f => f.name === name)
      },
      create_filter(name) {
        this.active_filter = Object.assign({}, this.filter_option_by_name(name))
        console.log("active filter", this.active_filter)
        this.dialog_open = true
      },
      set_filter_value(name, value) {
        console.log("set filter", value)
        let text = value
        if (this.active_filter.aspect.type === SELECT) {
          // debugger
          const selected_option = this.active_filter.aspect.items.find(i => i.value === value)
          text = this.$_.get(selected_option, "text", value)
        }
        const existing_filter = this.applied_filters.find(f => f.name === name)
        if (existing_filter) {
          existing_filter.value = value
        } else {
          this.applied_filters.push({
            "name": this.active_filter.name,
            "label": this.active_filter.label,
            "value": value,
            "text": text
          })
        }
        this.dialog_open = false
        setTimeout(() => {
          this.active_filter = null
        }, 100)
      },
      edit_filter(index) {
        this.active_filter = Object.assign({}, this.filter_option_by_name(this.applied_filters[index].name))
        this.dialog_open = true
      },
      remove_filter(index) {
        this.applied_filters.splice(index, 1)
      },
      filter_value(name) {
        console.log("filter_value")
        const existing_filter = this.applied_filters.find(f => f.name === name)
        if (existing_filter) {
          return existing_filter.value
        } else {
          return aspect_default_value(this.filter_option_by_name(name).aspect)
        }
      }
    }
  }
</script>

<style scoped>

</style>
