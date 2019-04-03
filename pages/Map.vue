<template >
  <div
  class="map"
  >
  <no-ssr>
  <MglMap
  :access-token="accessToken"
  :map-style="mapStyle"
  :zoom="zoom"
  @load="onMapLoaded"
  >
  <MglGeolocateControl ref="geolocateControl"/>
  </MglMap>
  </no-ssr>
  </div>


</template>

<script>

  /*

  .map
    no-ssr
    mglmap(:access-token='accessToken' :map-style='mapStyle' :zoom='zoom' @load='onMapLoaded')
      mglgeolocatecontrol(ref='geolocateControl')

   */

  export default {
    name: "Map",
    components: {
    },
    data() {
      return {
        accessToken: "pk.eyJ1IjoicmFtaW4taWN0YSIsImEiOiJjanBkeDk2M3YwbHBzM3FvM2p2cG16aTc2In0.IRybzK8J__XoNkgZPjm3iw", // your access token. Needed if you using Mapbox maps
        mapStyle: 'mapbox://styles/mapbox/streets-v11', // your map style,
        zoom: 7
      };
    },
    methods: {
      onMapLoaded() {

      },
    }
  };
</script>
