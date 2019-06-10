<template>
  <div class="map">
    <no-ssr>
      <MglMap
        :access-token="accessToken"
        :map-style="mapStyle"
        @load="onMapLoaded"

        @click="touch($event)"
      >
        <MglMarker :coordinates="coordinates">
          <!--<MglPopup anchor="top">
            <VCard>
              <div>Hello, I'm popup!</div>
            </VCard>
          </MglPopup>-->
        </MglMarker>
        <!--<v-btn :disabled="true" v-for="layerBtn in map_sources" :key="layerBtn.layerId" small @click="layer(layerBtn.layerId)"
               :color="layerClr(layerBtn.layerId)">{{layerBtn.title}}
        </v-btn> -->
        <v-text-field hideDetails readonly fullWidth :value="coordinate_string"></v-text-field>
        <v-btn small @click="done">
          Done
        </v-btn>
      </MglMap>
    </no-ssr>
  </div>
</template>

<script>

  //         @click="touch($event)"

  //  <MglGeolocateControl ref="geolocateControl" />

  //       <MglNavigationControl position="top-right" />
  // MglNavigationControl, MglGeojsonLayer
  import {MglMarker, MglPopup} from 'vue-mapbox';
  // MglNavigationControl, MglGeojsonLayer
  export default {
    name: "Map2",
    components: {MglMarker, MglPopup},
    head() {
      return {
        link: [{
          href: "https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.0/mapbox-gl.css",
          rel: "stylesheet"
        }]
      }
    },
    data() {
      return {
        accessToken: "pk.eyJ1IjoicmFtaW4zNiIsImEiOiJjamJ0eGo0cWQxbHo1MzJyMnV0bzhydjhzIn0.-q0FF4Jtuhc-wboaSA2E_A", // your access token. Needed if you using Mapbox maps
        mapStyle: "mapbox://styles/ramin36/cju64s1gh1d681fo65m14ytmx", //'mapbox://styles/mapbox/streets-v11', // your map style,
        coordinates: [0, 0],
        layerVisiblities: {
          koepenGeiger: true,
          "Weather stations": false
        },
        map_sources: [
          {
            layerId: "koepenGeiger", title: "Koeppen-Geiger"
          }
        ]
      };
    },
    methods: {
      layerClr(layer) {
        return this.layerVisiblities[layer] ? "#00DD1030" : "#77777720";
      },
      onMapLoaded(event) {
        this.map = event.map;
        this.map.setLayoutProperty("Weather stations", "visibility", "none");
      },
      layer(layer) {
        this.layerVisiblities[layer] = !this.layerVisiblities[layer];
        var newVal = this.layerVisiblities[layer] ? "visible" : "none";
        this.map.setLayoutProperty(layer, 'visibility', newVal);
      },
      touch({mapboxEvent}) {
        this.coordinates = [mapboxEvent.lngLat.lng, mapboxEvent.lngLat.lat]
      },
      done() {

      }
    },
    computed: {
      coordinate_string() {
        return this.coordinates[0].toString() + "   " + this.coordinates[1].toString()
      }
    }
  };
</script>

<style src="mapbox-gl/dist/mapbox-gl.css"></style>

<style>

  .container {
    height: 100%;
  }

  .map {
    height: 100%;
  }
</style>
