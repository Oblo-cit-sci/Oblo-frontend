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
          v-btn(@click="go_home()")
            v-icon mdi-home
        v-col(cols=7)
          v-select(label="Layers" :items="layer_options" multiple small-chips v-on:change="$emit('layer_select_change', $event)")
      v-row.ma-1(wrap justify-center)
        <!-- the v-show prevents reloading every time, when switching between entry and search-->
        Search(v-show="nav_mode_search"
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
  import Entry from "../entry/Entry";

  // search:
  //   <!--          :fixed_filters="location_pre_filter"-->

  export default {
    name: "MapNavigationDrawer",
    components: {Entry},
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
