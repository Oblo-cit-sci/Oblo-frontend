<template lang="pug">
  div
    Search(v-show="nav_mode_search"
      :preview_options="preview_options"
      :fixed_filters="location_pre_filter"
      @all_received_uuids="$emit('all_received_uuids', $event)"
      @preview_action="preview_action($event)")
</template>

<script>
  import Search from "~/components/global/Search"
  import MapNavigationMixin from "~/components/map/MapNavigationMixin"

  export default {
    name: "DomainMenu",
    mixins: [MapNavigationMixin],
    components: {Search},
    props: {
      domain: String
    },
    data() {
      return {}
    },
    computed: {
    },
    methods: {}
  }
</script>

<style scoped>

</style>
