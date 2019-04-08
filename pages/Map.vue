<template>
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
        <MglNavigationControl/>
      </MglMap>

    </no-ssr>

  </div>


</template>

<script>

  /*

      <v-btn @click="switchLayer('we')">Weather stations</v-btn>

   */

  import {
    MglNavigationControl,
  } from "vue-mapbox";


  export default {
    name: "Map",
    //layout: "simple",
    components: {MglNavigationControl}, //
    data() {
      return {
        accessToken: "pk.eyJ1IjoicmFtaW4taWN0YSIsImEiOiJjanBkeDk2M3YwbHBzM3FvM2p2cG16aTc2In0.IRybzK8J__XoNkgZPjm3iw", // your access token. Needed if you using Mapbox maps
        mapStyle: 'mapbox://styles/ramin36/cju64s1gh1d681fo65m14ytmx', // your map style,
        zoom: 2,
        center: [0, 0] //[2.108903, 41.497553]
      };
    },
    created() {
      this.map = null;
    },
    methods: {
      onMapLoaded(event) {
        /*
        console.log(event.map);
        this.map = event.map;
        this.map._canvas.height = window.height - 64 + "px";
        this.map.resize();
        */
      },
      switchLayer(layer) {
        console.log(layer);
      }
    }
  };
</script>

<style scoped>

  .map {
    height: 600px;
  }

  .mapboxgl-canvas {
    height: 600px;
  }
</style>
