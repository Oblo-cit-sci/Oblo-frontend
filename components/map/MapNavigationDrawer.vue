<template lang="pug">
  v-navigation-drawer(
    v-else
    app
    :permanent="drawer"
    v-model="drawer"
    :mini-variant="false"
    :clipped="true"
    :hide-overlay="true"
    temporary
    right
    :width="drawer_width"
    fixed)
    v-row
      v-col.col-sm-3
        v-btn(@click="back" nuxt)
          v-icon mdi-home
          span Back
      v-col.col-sm-7
        v-select(label="Layers" :items="layer_options" multiple small-chips v-on:change="$emit('layer_select_change', $event)")
      v-col.col-sm-3
        v-btn
          v-icon mdi-crosshairs-gps
    v-row.ma-1(wrap justify-center)
      Search(v-if="normal_map_mode && nav_mode_search"
        init_full
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
            EntryAspectView.ma-1.pa-2(:entry="selected_entry" mode="view")
</template>

<script>
    import MapNavigationMixin from "./MapNavigationMixin";
    import Search from "../Search";
    import EntryAspectView from "../EntryAspectView";


    export default {
        name: "MapNavigationDrawer",
        mixins: [MapNavigationMixin],
        components: {EntryAspectView, Search},
        computed: {
            drawer_width() {
                return this.$vuetify.breakpoint.lgAndUp ? 600 : 400
            }
        }
    }
</script>

<style scoped>

</style>
