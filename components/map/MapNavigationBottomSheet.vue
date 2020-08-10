<template lang="pug">
  v-bottom-sheet(
    app
    persistent
    no-click-animation
    v-model="drawer"
    scrollable
    hide-overlay)
    v-card(tile height="400")
      v-row
        v-col(cols=3)
          v-btn(@click="home()")
            v-icon mdi-home
      v-card-text
        v-row.ma-1(wrap justify-center)
          <!-- the v-show prevents reloading every time, when switching between entry and search-->
          Search(v-show="nav_mode_search"
            :preview_options="preview_options"
            :fixed_filters="location_pre_filter"
            @all_received_uuids="$emit('all_received_uuids', $event)"
            @preview_action="preview_action($event)")
          div(v-if="nav_mode_entry")
            v-row
              v-btn(@click="to_search_mode" Search)
                v-icon mdi-magnify
            v-row
              v-col
                Entry(:navigation_props="entry_navigation_props")
</template>

<script>
  import MapNavigationMixin from "./MapNavigationMixin";
  import Entry from "../entry/Entry";
  import Search from "~/components/global/Search"

  export default {
    name: "MapNavigationBottomSheet",
    components: {Entry, Search},
    mixins: [MapNavigationMixin]
  }
</script>

<style scoped>

</style>
