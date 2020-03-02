<template lang="pug">
  v-navigation-drawer(
    v-else
    app
    :permanent="drawer"
    v-model="drawer"
    :mini-variant="false"
    clipped
    hide-overlay
    temporary
    right
    :width="drawer_width"
    fixed)
    div.ml-2.mr-3
      v-row
        v-col(cols=3)
          v-btn(@click="back" nuxt)
            v-icon mdi-home
            span Back
        v-col(cols=7)
          v-select(label="Layers" :items="layer_options" multiple small-chips v-on:change="$emit('layer_select_change', $event)")
        v-col(cols=2)
          v-btn(@click="get_goto_device_location")
            v-icon mdi-crosshairs-gps
      v-row.ma-1(wrap justify-center)
        <!-- the v-show prevents reloading every time, when switching between entry and search-->
        Search(v-show="normal_map_mode && nav_mode_search"
          :preview_options="preview_options"
          :fixed_filters="location_pre_filter"
          v-on:received_search_results="update_map_entries($event)"
          @preview_action="preview_action($event)")
        div(v-if="normal_map_mode && nav_mode_entry")
          v-row
            v-btn(@click="to_search_mode" Search)
              v-icon mdi-magnify
          v-row
            v-col
              EntryView(:passed_uuid="selected_entry_uuid" :navigation_props="entry_navigation_props")
              <!-- EntryAspectView.ma-1.pa-2(:entry="selected_entry" mode="view")-->
</template>

<script>
  import MapNavigationMixin from "./MapNavigationMixin";
  import Search from "../Search";
  import EntryAspectView from "../EntryAspectView";
  import EntryView from "../EntryView";


  export default {
    name: "MapNavigationDrawer",
    components: {EntryView},
    mixins: [MapNavigationMixin],
    computed: {
      drawer_width() {
        return this.$vuetify.breakpoint.lgAndUp ? 600 : 400
      }
    }
  }
</script>

<style scoped>

</style>
