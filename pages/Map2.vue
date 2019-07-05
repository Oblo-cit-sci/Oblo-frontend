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
        <v-text-field hideDetails readonly fullWidth :value="coordinate_string"></v-text-field>
        <v-btn small @click="done">
          Done
        </v-btn>
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
        layerVisiblities: {
          climate: true,
          "stations": true
        },
        map_sources: [
          {
            id: "climate", layers: ["climate type copy"], title: "Koeppen-Geiger"
          },
          {
            id: "stations", layers: ["weather stations","weather stations age quality"], title: "Weather stations"
          }
        ]
      };
    },
    created() {
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
        if(layers.constructor === Array) {
          for(let l of layers) {
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
        let global_ref = this.$store.state.global_ref

        // todo.1
        //const draft = this.$store.state.edrafts.drafts[global_ref.draft_id]
        const entry_type = this.$store.getters.entry_type(draft.type_slug)

        /*
        this.$store.commit("edrafts/set_draft_aspect_value_by_ref", {
            draft_id: global_ref.draft_id,
            aspect_ref: global_ref.aspect_ref,
            entry_type: entry_type,
            value: {
              value:
                [{value: this.coordinates[0]}, {value: this.coordinates[1]}]
            }
          }
        )
         */
        // TODO , setting values from the map again...
        //const route = get_edit_route_for_ref(this.$store, this.$store.state.global_ref)
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
