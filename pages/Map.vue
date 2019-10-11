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
      </client-only>
    </v-layout>
  </div>
</template>

<script>

    /*
          <v-flex column sm2 md2 lg2>
          <div>
            <v-btn router to="/" nuxt> Back</v-btn>
            <v-btn
              v-for="map_source in map_sources_iter" :key="map_source[0]" small @click="switch_layer(map_source[0])"
              :color="layerClr(map_source[0])"> {{map_source[1].title}}
            </v-btn>
          </div>
        </v-flex>
     */

    import {MglMarker, MglPopup} from 'vue-mapbox';
    import {access_token, licci_style_map} from "../lib/services/mapbox";
    import {pack_value} from "../lib/aspect";

    const SIMPLE_MODE = 0

    export default {
        name: "Map",
        components: {MglMarker, MglPopup},
        head() {
            return {
                link: [{
                    href: "https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.0/mapbox-gl.css",
                    rel: "stylesheet"
                }]
            }
        },
        layout: "map_layout",
        data() {
            return {
                accessToken: access_token, // your access token. Needed if you using Mapbox maps
                mapStyle: licci_style_map, //'mapbox://styles/mapbox/streets-v11', // your map style,
                coordinates: [0, 0],
                entries: [],
                mode: null,
                modes: {SIMPLE_MODE: SIMPLE_MODE},
                mapCssStyle: "",
                layerVisiblities: {
                    climate: false,
                    stations: false
                },
                map_sources: new Map([
                    ["climate", {
                        layers: ["climate type copy"], title: "Koeppen-Geiger"
                    }],
                    ["stations", {
                        layers: ["weather stations", "weather stations age quality"], title: "Weather stations"
                    }]
                ]),
                map_sources_iter: null
            }
        },
        created() {
            this.mode = this.$store.state.mapmode.select || SIMPLE_MODE
            this.map_sources_iter = Array.from(this.map_sources.entries())
        },
        methods: {
            layerClr(l_id) {
                return this.layerVisiblities[l_id] ? "#00DD1030" : "#77777720";
            },
            onMapLoaded(event) {
                this.map = event.map;
                for (let l of this.map_sources_iter) {
                    this.update_layer(l[0])
                }
            },
            switch_layer(l_id) {
                this.layerVisiblities[l_id] = !this.layerVisiblities[l_id]
                this.update_layer(l_id)
            },
            update_layer(l_id) {
                console.log(l_id)
                for (let l of this.map_sources.get(l_id).layers) {
                    let newVal = this.layerVisiblities[l_id] ? "visible" : "none";
                    this.map.setLayoutProperty(l, 'visibility', newVal);
                }
            },
            touch({mapboxEvent}) {
                this.coordinates = [mapboxEvent.lngLat.lng, mapboxEvent.lngLat.lat]
            },
            done() {
                this.$store.commit(ENTRIES_SET_ENTRY_VALUE, {
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
        },
        mounted() {
            this.mapCssStyle = "height: " + document.getElementById("fullContainer").clientHeight + "px"
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
