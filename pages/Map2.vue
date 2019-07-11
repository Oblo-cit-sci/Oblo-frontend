<template>
  <div class="map">
    <no-ssr>
      <MglMap
        :access-token="accessToken"
        :map-style="mapStyle"
        @load="onMapLoaded"
        @click="touch($event)"
      >
        <div v-if="mode !== modes.SIMPLE_MODE">
          <MglMarker :coordinates="coordinates">
            <!--<MglPopup anchor="top">
              <VCard>
                <div>Hello, I'm popup!</div>
              </VCard>
            </MglPopup>-->
          </MglMarker>
          <v-text-field hideDetails readonly fullWidth :value="coordinate_string"></v-text-field>
          <v-btn small @click="done">
            Done
          </v-btn>
        </div>
      </MglMap>
      <v-btn v-for="layerBtn in map_sources" :key="layerBtn.id" small @click="layer(layerBtn.id, layerBtn.layers)"
             :color="layerClr(layerBtn.id)"> {{layerBtn.title}}
      </v-btn>
    </no-ssr>
  </div>
</template>

<script>

  import {MglMarker, MglPopup} from 'vue-mapbox';
  import {access_token, licci_style_map} from "../lib/services/mapbox";
  import {pack_value} from "../lib/aspect";

  const SIMPLE_MODE = 0

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
        accessToken: access_token, // your access token. Needed if you using Mapbox maps
        mapStyle: licci_style_map, //'mapbox://styles/mapbox/streets-v11', // your map style,
        coordinates: [0, 0],
        entries: [],
        mode: null,
        modes: {SIMPLE_MODE: SIMPLE_MODE},
        layerVisiblities: {
          climate: false,
          stations: false
        },
        map_sources: [
          {
            id: "climate", layers: ["climate type copy"], title: "Koeppen-Geiger"
          },
          {
            id: "stations", layers: ["weather stations", "weather stations age quality"], title: "Weather stations"
          }
        ]
      };
    },
    created() {
      this.mode = this.$store.state.mapmode.select || SIMPLE_MODE
    },
    methods: {
      layerClr(l_id) {
        return this.layerVisiblities[l_id] ? "#00DD1030" : "#77777720";
      },
      onMapLoaded(event) {
        this.map = event.map;
        //console.log(this.map)
        //this.map.setLayoutProperty("", "visibility", "none");
      },
      layer(l_id, layers) {
        this.layerVisiblities[l_id] = !this.layerVisiblities[l_id]
        if (layers.constructor === Array) {
          for (let l of layers) {
            var newVal = this.layerVisiblities[l_id] ? "visible" : "none";
            this.map.setLayoutProperty(l, 'visibility', newVal);
          }
        } else {
          // todo, but basically the same
        }
      },
      touch({mapboxEvent}) {
        this.coordinates = [mapboxEvent.lngLat.lng, mapboxEvent.lngLat.lat]
      },
      done() {
        this.$store.commit("entries/set_entry_value", {
          ...this.$store.state.global_ref,
          value:
            pack_value([{value: this.coordinates[0]}, {value: this.coordinates[1]}])
        })

        let route = "/entry/" + this.$store.state.global_ref.uuid
        this.$router.push(route)
      }
    },
    computed: {
      coordinate_string() {
        return this.coordinates[0].toString() + "   " + this.coordinates[1].toString()
      }
    }
  }
  ;
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
