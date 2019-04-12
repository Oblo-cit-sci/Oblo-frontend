<template>
  <div class="map">
    <no-ssr>
      <MglMap
        :access-token="accessToken"
        :map-style="mapStyle"
        @load="onMapLoaded"
        :center="center"
      >
        <MglNavigationControl ref="navigationControl" position="bottom-right" />
        <MglGeolocateControl/>

        <MglPopup :coordinates="popupCoordinates">
          <span>Hello world!</span>
        </MglPopup>
      </MglMap>
    </no-ssr>
  </div>
</template>

<script>


  export default {
    name: "Map",
    //layout: "simple",
   components: {  }, //
    data() {
      return {
        accessToken: "pk.eyJ1IjoicmFtaW4taWN0YSIsImEiOiJjanVkdDluMWswNW82NDFwaHJlZTIwbWZ6In0.MBQHMDkvg96WE74tuB87Zg", // your access token. Needed if you using Mapbox maps
        mapStyle: 'mapbox://styles/ramin-icta/cjuazr4bx01fp1fkwdko87m2d', // your map style,
        zoom: 2,
        center: [0, 0] ,//[2.108903, 41.497553]
        popupCoordinates: [0,0]
      };
    },
    created() {
     // this.map = null;
      console.log(this.$mapbox);
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
