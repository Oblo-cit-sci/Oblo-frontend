<template>
  <div>
    <v-layout class="map row">
      <client-only>
        <MglMap :style="mapCssStyle"
                :access-token="accessToken"
                :map-style="mapStyle"
                @load="onMapLoaded"
                @click="touch($event)"
        >
          <div v-if="mode === 'coordinate'">
            <MglMarker v-if="display_coordinates" :coordinates="display_coordinates">
              <!--<MglPopup anchor="top">
                <VCard>
                  <div>Hello, I'm popup!</div>
                </VCard>
              </MglPopup>-->
            </MglMarker>
            <!--<v-text-field hideDetails readonly fullWidth :value="coordinate_string"></v-text-field>-->
          </div>
          <div v-for="entry in entries" :key="entry.uuid">
            <MglMarker v-for="(loc, index) in entry.location"
                       :coordinates="transform_loc(loc)"
                       :key="index"
                       @click="select_entry_marker($event, entry.uuid)">
              <!--<MglPopup anchor="top">
                <VCard>
                  <div>Hello, I'm popup!</div>
                </VCard>
              </MglPopup>-->
            </MglMarker>
          </div>
        </MglMap>
        <v-btn v-if="done" style="bottom:2%; right:25%" fixed dark fab bottom right color="success" @click="back">
          <v-icon>mdi-check</v-icon>
        </v-btn>
        <v-btn v-if="done" style="bottom:2%; right:20%" fixed dark fab bottom right color="orange darken-3"
               @click="back_to_entry">
          <v-icon>mdi-map-marker-question-outline</v-icon>
        </v-btn>
      </client-only>
    </v-layout>
  </div>
</template>

<script>


  import {MglMarker, MglPopup} from 'vue-mapbox';
  import {access_token, licci_style_map, rev_geocode} from "../lib/services/mapbox";
  import {VIEW} from "../lib/consts";


  const COORDINATE = "coordinate"
  const modes = [VIEW, COORDINATE]

  import {mapGetters} from "vuex"
  import {MAP_GOTO_LOCATION} from "../lib/store_consts";

  // mode could also be COORDINATE

  export default {
    name: "Map",
    components: {MglMarker, MglPopup},
    props: {
      test_prop: String
    },
    head() {
      return {
        link: [{
          href: "https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.0/mapbox-gl.css",
          rel: "stylesheet"
        }]
      }
    },
    layout: "map_layout_depr",
    data() {
      return {
        accessToken: access_token, // your access token. Needed if you using Mapbox maps
        mapStyle: licci_style_map, //'mapbox://styles/mapbox/streets-v11', // your map style,
        display_coordinates: null,
        mapCssStyle: "",
      }
    },
    methods: {
      select_entry_marker(event, entry_uuid) {
        this.$store.dispatch("map/select_entry", entry_uuid)
      },
      layerClr(l_id) {
        return this.layerVisiblities[l_id] ? "#00DD1030" : "#77777720";
      },
      onMapLoaded(event) {
        this.map = event.map
        this.set_layer_status()
        console.log("map", this.map)
      },
      transform_loc(loc) {
        // todo take the NaN check out and filter earlier...
        if (loc.hasOwnProperty("lon") && loc.lat && !isNaN(loc.lon) && !isNaN(loc.lat)) {
          return [loc.lon, loc.lat]
        } else {
          return loc
        }
      },
      touch({mapboxEvent}) {
        console.log(mapboxEvent.lngLat.lng, mapboxEvent.lngLat.lat)
        if (this.mode === COORDINATE) {
          this.display_coordinates = [mapboxEvent.lngLat.lng, mapboxEvent.lngLat.lat]
          this.$store.commit("map/marker_point", this.display_coordinates)
        } else {
          this.rev_geocode({lon:mapboxEvent.lngLat.lng,lat: mapboxEvent.lngLat.lat})
        }
      },
      back_to_entry() {
        console.log("BACK TO ENTRY")
      },
      rev_geocode(coordinate) {
        rev_geocode(this.$axios, coordinate).then(res => {
          console.log(res)
        }).catch(err => {
          console.log(err)
        })
      },
      set_layer_status(layers = this.layer_status) {
        //console.log(this.map.style._layers)
        for (let layer in layers) {
          this.map.setLayoutProperty(layer, 'visibility', layers[layer] ? "visible" : "none")
        }
      }
    },
    computed: {
      coordinate_string() {
        return this.coordinates[0].toString() + "   " + this.coordinates[1].toString()
      },
      mode() {
        return this.$route.query.mode || VIEW
      },
      ...mapGetters({
        entries: "map/entries",
        layer_status: "map/layer_status"
      }),
      done() {
        switch (this.mode) {
          case COORDINATE:
            return this.display_coordinates
          default:
            return false
        }
      },
      goto_location() {
        return this.$store.getters[MAP_GOTO_LOCATION]()
      }
    },
    mounted() {
      this.mapCssStyle = "height: " + document.getElementById("fullContainer").clientHeight + "px"
    },
    watch: {
      goto_location(val) {
        const center = this.transform_loc(val)
        this.map.flyTo({
          center: center,
          speed: 0.8, // make the flying slow
          easing: function (t) {
            return t;
          }
        });
      },
      layer_status(layers) {
        this.set_layer_status(layers)
      }
    }
  }

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
