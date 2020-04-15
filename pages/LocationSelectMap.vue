<template lang="pug">
  v-layout.map.row
    client-only
      .buttongroup
        div
          v-btn(dark fab bottom right color="warning" @click="back")
            v-icon mdi-arrow-left
          v-btn(v-if="show_select_confirm" dark fab bottom right color="green" @click="confirm_select")
            v-icon mdi-map-marker-check
          v-text-field.mt-4(solo small
          v-model="search_query"
            hint="press enter or click the search button"
            append-outer-icon="mdi-magnify"
            @click:append-outer="search_location"
            @keydown="search_keypress($event)"
            :loading="btn_loading_search_location")
        v-snackbar(:value="selected_coordinates" :timeout="0" selected_place right top) {{selected_place_text}}
      MglMap(:style="mapCssStyle"
        :access-token="accessToken"
        :map-style="mapStyle"
        @load="onMapLoaded"
        :center="center_coordinates"
        @click="touch($event)")
        MglMarker(v-if="selected_coordinates" :coordinates="selected_coordinates")
</template>

<script>
  import {MglMarker, MglPopup} from "vue-mapbox";
  import {access_token, licci_style_map, location_search, rev_geocode} from "../lib/services/mapbox";
  import {pack_value} from "../lib/aspect";
  import {arr2coords} from "../lib/map_utils";
  import MapNavigationDrawer from "../components/map/MapNavigationDrawer";
  import MapNavigationBottomSheet from "../components/map/MapNavigationBottomSheet";
  import {ENTRIES_SET_ENTRY_VALUE} from "../store/entries";
  import {place2str} from "../lib/location";
  import {MAP_RESET_TO_SELECT_ASPECT_LOCATION, MAP_SELECTED_LOCATION} from "../store/map";
  import {default_place_type} from "~/lib/consts"


  export default {
    name: "LocationSelectMap",
    mixins: [],
    components: {MapNavigationBottomSheet, MapNavigationDrawer, MglMarker, MglPopup},
    props: {},
    layout: "map_layout",
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
        accessToken: access_token,
        mapCssStyle: "",
        mapStyle: licci_style_map,
        center_coordinates: [-0.8844128193341589, 37.809519042232694],
        //  MODE_ASPECT_POINT
        selected_coordinates: null,
        querying_location: false,
        selected_place: null,
        selected_place_text: null,
        //
        search_query: "",
        btn_loading_search_location: false
      }
    },
    created() {
      this.map = null
    },
    mounted() {
      this.mapCssStyle = "height: " + document.getElementById("fullContainer").clientHeight + "px"
    },
    computed: {
      display_mdDown() {
        return this.$vuetify.breakpoint.mdAndDown
      },
      show_select_confirm() {
        return this.selected_coordinates
      },
    },
    methods: {
      onMapLoaded(event) {
        this.map = event.map
      },
      transform_loc(loc) {
        // todo take the NaN check out and filter earlier...
        if (loc.hasOwnProperty("lon") && loc.lat && !isNaN(loc.lon) && !isNaN(loc.lat)) {
          return [loc.lon, loc.lat]
        } else {
          return loc
        }
      },
      back() {
        this.$router.back()
      },
      search_keypress(keyEvent) {
        // Enter,  this is the most robust among all platforms (desktop, mobile, chrome, ff)
        if (keyEvent.keyCode === 13) {
          this.search_location()
        }
      },
      search_location() {
        this.btn_loading_search_location = true
        location_search(this.$axios, this.search_query, {types: default_place_type, language: "en"}).then(data => {
          this.btn_loading_search_location = false
          if (data.features.length === 0) {
            this.error_snackbar("No place with that name")
          } else {
           this.map.fitBounds(data.features[0].bbox)
          }
        }).catch(err => {
          console.log(err)
          this.btn_loading_search_location = false
        })
      },
      confirm_select() {
        const value = pack_value({
          coordinates: arr2coords(this.selected_coordinates),
          place: this.selected_place
        })
        const aspect_loc = this.$store.getters["map/to_select_aspect_location"]
        if (aspect_loc) {
          this.$store.commit(MAP_RESET_TO_SELECT_ASPECT_LOCATION)
          this.$store.dispatch(ENTRIES_SET_ENTRY_VALUE, {aspect_loc: aspect_loc, value: value})
        } else {
          this.$store.commit(MAP_SELECTED_LOCATION, value)
        }
        this.$router.back()
      },
      touch({mapboxEvent}) {
        this.selected_coordinates = [mapboxEvent.lngLat.lng, mapboxEvent.lngLat.lat]
        this.selected_place = null
        this.selected_place_text = "querying location name..."
        // alt_rev_geocode(this.$axios, {lon: mapboxEvent.lngLat.lng, lat: mapboxEvent.lngLat.lat}).then(data => {
        //   console.log("alternative", data)
        // }).catch(err => {
        //   console.log(err)
        // })
        rev_geocode(this.$axios, {lon: mapboxEvent.lngLat.lng, lat: mapboxEvent.lngLat.lat}).then(data => {
          this.querying_location = false
          if (data.features.length === 0) { // oceans
            this.selected_place_text = "No location name"
          } else {
            this.selected_place = {}
            this.$_.forEach(data.features, feature => {
              this.selected_place[feature.place_type[0]] = feature.text
            })
            this.selected_place_text = place2str(this.selected_place)
          }
        }).catch((err) => {
          console.log("no location found")
          this.querying_location = false
        })
      }
    },
    beforeRouteLeave(to, from, next) {
      next()
    },
    watch: {
      selected_entry(selected_uuid, previous_selected) {
        if (previous_selected) {
          this.change_entry_markers_mode(previous_selected, false)
        }
      },
      navigation_mode(mode) {
        if (mode === SEARCH) {
          this.selected_entry = null
        }
        this.change_entry_markers_mode(this.selected_entry, true)
      }
    }
  }
</script>

<style src="mapbox-gl/dist/mapbox-gl.css"></style>

<style>

  .buttongroup {
    top: 2%;
    left: 0.5%;
    position: fixed;
    height: 5%;
    z-index: 1
  }

</style>
