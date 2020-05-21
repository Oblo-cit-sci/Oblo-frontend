<template lang="pug">
  div#mapC
    mapbox#map(
      :access-token="access_token"
      :map-options="default_map_options"
      @map-load="onMapLoaded")
</template>

<script>
  import Mapbox from 'mapbox-gl-vue'

  import MapIncludeMixin from "~/components/map/MapIncludeMixin"

  export default {
    name: "Map2",
    layout: "map_layout",
    mixins: [MapIncludeMixin],
    components: {Mapbox},
    props: {},
    data() {
      return {}
    },
    computed: {},
    methods: {}
  }
</script>

<style scoped>

  #mapC {
    width: 100%;
    height: 100%;
  }

  #map {
    width: 100%;
    height: 100%;
  }
</style>
