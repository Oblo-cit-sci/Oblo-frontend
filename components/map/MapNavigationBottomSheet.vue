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
          v-btn(@click="back" nuxt)
            v-icon mdi-home
            span Back
        v-col(cols=7)
          v-select(label="Layers" :items="layer_options" multiple small-chips v-on:change="$emit('layer_select_change', $event)")
        v-col(cols=2)
          v-btn(@click="get_goto_device_location")
            v-icon mdi-crosshairs-gps
      v-card-text
        v-row.ma-1(wrap justify-center)
          <!-- the v-show prevents reloading every time, when switching between entry and search-->
          Search(v-show="nav_mode_search"
            init_full
            :preview_options="preview_options"
            :fixed_filters="location_pre_filter"
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
  import Entry from "../Entry";

  export default {
    name: "MapNavigationBottomSheet",
    components: {Entry},
    mixins:[MapNavigationMixin]
  }
</script>

<style scoped>

</style>
