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
      Search(v-if="normal_mode"
        :preview_options="{actions: ['goto_location']}"
        v-on:received_search_results="update_map_entries($event)" clean)
</template>

<script>
    import MapNavigationMixin from "./MapNavigationMixin";
    import Search from "../Search";


    export default {
        name: "MapNavigationDrawer",
        mixins: [MapNavigationMixin],
        components: {Search},
        computed: {
            drawer_width() {
                return this.$vuetify.breakpoint.lgAndUp ? 600 : 400
            }
        }
    }
</script>

<style scoped>

</style>
