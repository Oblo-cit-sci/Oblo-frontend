<template lang="pug">
  div
    div(v-if="!readOnly")
      div.mb-1
        div
          .ml-2.mt-2(v-if="search_location_input_option")
            div From place search
            v-autocomplete(
              :search-input.sync="search_query"
              hint="press enter or click the search button"
              append-outer-icon="mdi-magnify"
              @click:append-outer="search_location"
              @keydown="search_keypress($event)"
              @input="selected_search_result = $event"
              @click:clear="clear"
              :loading="btn_loading_search_location"
              :items="search_result_options"
              no-filter
              hide-no-data
              auto-select-first
              v-model="place_select__"
              clearable)
            <!--            span Public location:-->
            <!--            span-->
            <!--              v-chip-group(v-if="has_place" active-class="primary&#45;&#45;text" mandatory v-model="public_location_precision")-->
            <!--                v-chip(v-for="(place_part, index) in place_parts" :key="index") {{place_part}}-->
    div(v-else)
      span.body-1.readonly-aspect {{place_name}}
      v-btn(v-if="show_goto_button" icon @click="goto_location")
        v-icon mdi-map-marker
    client-only
      mapbox.crosshair.mt-3(v-if="show_map"
        style="height:400px"
        :access-token="access_token"
        :map-options="map_options"
        @map-load="onMapLoaded"
        @click="map_location_selected"
        navControl="is_edit_mode")
</template>

<script>

  import Mapbox from 'mapbox-gl-vue'
  import {array2coords, create_location_error, place2str} from "~/lib/location";
  import SingleSelect from "../input/SingleSelect";
  import {default_place_type} from "~/lib/consts";
  import TriggerSnackbarMixin from "../TriggerSnackbarMixin";
  import AspectComponentMixin from "./AspectComponentMixin";
  import MapIncludeMixin from "~/components/map/MapIncludeMixin"
  import {mapboxgl_lngLat2coords, place_feature2place} from "~/lib/map_utils"
  import GeocodingMixin from "~/components/map/GeocodingMixin"
  import {MAP_GOTO_LOCATION} from "~/store/map"

  // "attr.input" options
  const DEVICE = "device"
  const MAP = "map"
  const SEARCH = "search"

  // "attr.output" attribute defines what is readable, also what is stored
  // default both
  const LOCATION = "location" // gps location, just a icon, that shows it on the map
  const PLACE = "place" // name by the details"
  const default_output = [LOCATION, PLACE]

  // below place: "locality", "neighborhood"

  export default {
    name: "LocationAspect",
    components: {SingleSelect, Mapbox},
    mixins: [AspectComponentMixin, TriggerSnackbarMixin, MapIncludeMixin, GeocodingMixin],
    data() {
      return {
        search_query: null,
        initial_autocomplete_reset: 2, // catch first 2 emit of null: ARGH
        location_marker: null,
        btn_loading_search_location: false,
        search_results: null,
        selected_search_result: undefined, // this because, clear sets it to that too,
        place_select__: null, // this in v-model is only used because of https://github.com/vuetifyjs/vuetify/issues/11383
        public_location_precision: null
      }
    },
    computed: {
      //  check for attr.input.___
      device_location_input_option() {
        return this.has_input_option(DEVICE)
      },
      show_map() {
        return this.$route.name !== "Map" && (this.is_edit_mode && this.map_location_input_option || this.is_view_mode)
      },
      show_goto_button() {
        return this.is_view_mode && this.$route.name === "Map"
      },
      map_location_input_option() {
        return this.has_input_option(MAP)
      },
      search_location_input_option() {
        return this.has_input_option(SEARCH)
      },
      // this is for the MapIncludeMixin to show the control
      map_show_geolocate_ctrl() {
        return this.is_edit_mode && this.device_location_input_option
      },
      location_set() {
        return this.value !== null
      },
      has_place() {
        return this.location_set && this.value.place && !this.$_.isEmpty(this.value.place)
      },
      place_parts() {
        if (!this.has_place)
          return []
        else {
          const options = []
          for (let place_type of default_place_type) {
            if (this.value.place.hasOwnProperty(place_type)) {
              options.push(this.value.place[place_type])
            }
          }
          return options
        }
      },
      //  check for attr.output.___
      has_output_location() {
        return this.has_output(LOCATION)
      },
      has_output_place() {
        return this.has_output(PLACE)
      },
      search_result_options() {
        return this.$_.map(this.search_results, f => {
          return {value: f.id, text: f.place_name}
        })
      },
      place_name() {
        // could be just this.has_place
        if (this.value && this.value.place)
          return place2str(this.value.place)
      },
      map_options() {
        if (this.is_view_mode) {
          if (this.value && this.value.coordinates) {
            return Object.assign(this.default_map_options, {
              center: this.value.coordinates,
              zoom: 3,
              interactive: false
            })
          }
        } else {
          return this.default_map_options
        }
      }
    },
    created() {
      // debugger
      console.log("loc-asp create", this.place_name)

      if (this.value) {
        this.search_query = this.place_name
        this.place_select__ = this.place_name
        this.search_results = [{id: this.place_name, place_name: this.place_name}]
      }
    },
    mounted() {
    },
    methods: {
      geolocate_success(location) {
        this.reset()
        let value = {}
        if (this.has_output_location) {
          // todo this should also be called at other situations
            value.coordinates = {
              lon: location.coords.longitude,
              lat: location.coords.latitude,
            }
        }
        if ((this.has_output_place)) {
          const place_types = this.aspect.attr.place_types || default_place_type
          this.rev_geocode(
            {lon: location.coords.longitude, lat: location.coords.latitude},
            {place_types}).then((data) => {
            value.place = {}
            this.$_.forEach(data.features, feature => {
              console.log("FF", feature)
              value.place[feature.place_type[0]] = feature.text
            })
            this.update_value(value)
          }).catch((err) => {
            console.log("error: mapbox api error", err)
          }) // must be with else, cuz its async
        } else {
          this.update_value(value)
          // this.update_value(value)
        }
      },
      geolocate_error() {
        this.error_snackbar("Could not obtain location")
      },
      search_keypress(keyEvent) {
        // Enter,  this is the most robust among all platforms (desktop, mobile, chrome, ff)
        if (keyEvent.keyCode === 13) {
          this.search_location()
        }
      },
      clear() {
        console.log("clear")
        this.update_value(null)
      },
      reset() {
        console.log("reset")
        this.selected_search_result = undefined
        this.search_query = ""
        if (this.location_marker) {
          this.location_marker.remove()
        }
      },
      search_location() {
        this.btn_loading_search_location = true
        this.location_search(this.search_query, {types: default_place_type, language: "en"}).then(data => {
          this.btn_loading_search_location = false
          if (data.features.length === 0) {
            this.error_snackbar("No place with that name")
          } else {
            this.search_results = data.features.filter(res => res.relevance > 0.34)
          }
        }).catch(err => {
          console.log(err)
          this.btn_loading_search_location = false
        })
      },
      has_input_option(type) {
        return (this.aspect.attr.input || []).includes(type)
      },
      has_output(type) {
        return (this.aspect.attr.output || default_output).includes(type)
      },
      map_location_selected(map, mapboxEvent) {
        console.log("map loc selected")
        if (this.is_view_mode)
          return
        let value = {
          coordinates: mapboxgl_lngLat2coords(mapboxEvent.lngLat),
          place: {}
        }
        if (this.has_output_place) {
          this.rev_geocode({lon: mapboxEvent.lngLat.lng, lat: mapboxEvent.lngLat.lat}).then(data => {
            this.querying_location = false
            if (data.features.length === 0) { // oceans
              // todo add filler
              //this.selected_place_text = "No location name"
            } else {
              console.log(data.features)
              this.search_query = data.features[0].place_name
              value.place = place_feature2place(data.features[0])
            }
          }).catch((err) => {
            console.log("no location found")
            this.querying_location = false
          }).finally(() => {
            this.update_value(value)
          })
        }
      },
      update_marker(flyTo = false) {
        const coordinates = this.value.coordinates
        if (this.location_marker) {
          this.location_marker.remove()
        }
        this.location_marker = new this.mapboxgl.Marker()
        this.location_marker.setLngLat(coordinates).addTo(this.map)
        if (flyTo) {
          this.map.flyTo({
            center: coordinates,
            essential: true // this animation is considered essential with respect to prefers-reduced-motion
          })
        }
      },
      goto_location() {
        this.$store.commit(MAP_GOTO_LOCATION, this.value)
      }
    },
    watch: {
      selected_search_result(sel) {
        // console.log("selected_search_result-watch", sel)
        if (!sel) {
          this.update_value(null)
        } else {
          const feature = this.$_.find(this.search_results, feature => feature.id === sel)
          let value = {
            coordinates: array2coords(feature.geometry.coordinates),
            place: place_feature2place(feature)
          }
          this.update_value(value)
        }
      },
      value(value) {
        console.log("location aspect value watch", value)
        if (!value) {
          this.reset()
          return
        }
        if (this.map_loaded) {
          this.update_marker(true)
        }
        // this when the value comes down as cache /or in whatever way
        // if(value.place && !this.search_query) {
        //   this.search_query = place_feature2place(value.place)
        // }
      },
      map_loaded() {
        if (this.value && this.value.coordinates) {
          this.update_marker()
        }
      }
    }
  }
</script>

<style scoped>

  .search_part {
    margin: 6px 8px;
  }

</style>
