<template lang="pug">
  div
    Search(v-show="nav_mode_search"
      :preview_options="preview_options"
      :fixed_filters="location_pre_filter"
      @all_received_uuids="$emit('all_received_uuids', $event)"
      @preview_action="preview_action($event)")
    div(v-if="nav_mode_entry")
      v-row
        v-btn(@click="unselect_entry" Search)
          v-icon mdi-arrow-left-thick
      v-row
        v-col
          Entry(:navigation_props="entry_navigation_props")
</template>

<script>
  import Search from "~/components/global/Search"
  import MapNavigationMixin from "~/components/map/MapNavigationMixin"
  import Entry from "~/components/entry/Entry"
  import HasMainNavComponentMixin from "~/components/global/HasMainNavComponentMixin"

  export default {
    name: "DomainMenu",
    mixins: [MapNavigationMixin, HasMainNavComponentMixin],
    components: {Entry, Search},
    props: {
      domain: String
    },
    data() {
      return {}
    },
    computed: {
    },
    methods: {},
    watch: {
      // domain_navigation_mode(mode, old_mode) {
      //   console.log("DomainMenu.watch.domain_navigation_mode", mode)
      // }
    }
  }
</script>

<style scoped>

</style>
