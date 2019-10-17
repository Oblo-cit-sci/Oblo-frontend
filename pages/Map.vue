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
        </MglMap>
        <v-btn v-if="done" style="bottom:2%; right:25%" fixed dark fab bottom right color="success" @click="back">
          <v-icon>mdi-check</v-icon>
        </v-btn>
        <v-btn v-if="done" style="bottom:2%; right:20%" fixed dark fab bottom right color="orange darken-3" @click="rev_geocode">
          <v-icon>mdi-map-marker-question-outline</v-icon>
        </v-btn>
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
    import {access_token, licci_style_map, rev_geocode} from "../lib/services/mapbox";
    import {VIEW} from "../lib/consts";


    const COORDINATE = "coordinate"
    const modes = [VIEW, COORDINATE]

    /*
        v-btn(style="bottom:2%; right:2 5%" fixed dark fab bottom right color="success" @click="drawer = !drawer")
      v-icon mdi-check
     */
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
                display_coordinates: null,

                entries: [],
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
                if(this.mode === COORDINATE) {
                    this.display_coordinates = [mapboxEvent.lngLat.lng, mapboxEvent.lngLat.lat]
                    this.$store.commit("map/marker_point", this.display_coordinates)
                }
            },
            rev_geocode() {
                rev_geocode(this.$axios, this.display_coordinates).then(res => {
                    console.log(res)
                }).catch(err => {
                    console.log(err)
                })

            },
            back() {
                console.log("back")
                /*
                todo
                SET EDIT
                entry nav mixin
                this.$store.commit(ENTRIES_SET_ENTRY_VALUE, {
                    ...this.$store.state.global_ref,
                    value:
                        pack_value([{value: this.coordinates[0]}, {value: this.coordinates[1]}])
                })

                let route = "/entry/" + this.$store.state.global_ref.uuid
                this.$router.push(route)
                 */
            }
        },
        computed: {
            coordinate_string() {
                return this.coordinates[0].toString() + "   " + this.coordinates[1].toString()
            },
            mode() {
              return this.$route.query.mode || COORDINATE
            },
            done() {
                switch(this.mode) {
                    case COORDINATE:
                        return this.display_coordinates
                    default:
                        return false
                }
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
