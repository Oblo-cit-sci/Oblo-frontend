<template>
  <div class="map">
    <no-ssr>
      <MglMap
        :access-token="accessToken"
        :map-style="mapStyle"
        @load="onMapLoaded"
        :center="center"
      >
        <MglGeolocateControl v-if="is_on" ref="geolocateControl" />
        <MglNavigationControl position="top-right" />
        <MglPopup :coordinates="popupCoordinates">
          <span>Hello world!</span>
        </MglPopup>
      </MglMap>
      <v-btn @click="back">
        back
      </v-btn>
    </no-ssr>
  </div>
</template>

<script>

  import {  MglNavigationControl, MglMarker, MglPopup, MglGeojsonLayer } from 'vue-mapbox';

  /*

   */

  export default {
    name: "Map",
    layout: "simple",
    components: { MglNavigationControl, MglMarker, MglPopup, MglGeojsonLayer },
    data() {
      return {
        accessToken: "pk.eyJ1IjoicmFtaW4taWN0YSIsImEiOiJjanVkdDluMWswNW82NDFwaHJlZTIwbWZ6In0.MBQHMDkvg96WE74tuB87Zg", // your access token. Needed if you using Mapbox maps
        mapStyle: 'mapbox://styles/ramin-icta/cjuazr4bx01fp1fkwdko87m2d', // your map style,
        zoom: 2,
        center: [0, 0],//[2.108903, 41.497553]
        popupCoordinates: [0, 0],
        is_on: true
      };
    },
    created() {
      this.map = null;
    },
    methods: {
      onMapLoaded(event) {
        this.map = event.map;
        //this.map._canvas.height = window.height - 64 + "px";
        //this.map.resize()

      },
      switchLayer(layer) {
      },
      back() {
        this.is_on = false
        this.$router.push("/")
      }
    }
  };
</script>

<style src="mapbox-gl/dist/mapbox-gl.css"></style>



<style scoped>

  .map {
    height: 600px;
  }

  .container {
    height: 100%;
    padding: 0;
    margin: 0;
  }

</style>
