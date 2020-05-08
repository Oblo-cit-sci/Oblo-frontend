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
              clearable)
    div(v-else)
      p.body-1.readonly-aspect {{location_view}}
      v-btn(v-if="location_set" @click="goto_location(value, entry_uuid())")
        v-icon mdi-map-marker
    mapbox.crosshair.mt-3(v-if="show_map"
      style="height:400px"
      :access-token="access_token"
      :map-options="options"
      @map-load="onMapLoaded"
      @click="map_location_selected")
</template>

<script>

  import Mapbox from 'mapbox-gl-vue'
  import {array2coords, create_location_error} from "~/lib/location";
  import SingleSelect from "../input/SingleSelect";
  import {default_place_type} from "~/lib/consts";
  import TriggerSnackbarMixin from "../TriggerSnackbarMixin";
  import MapJumpMixin from "../map/MapJumpMixin";
  import AspectComponentMixin from "./AspectComponentMixin";
  import MapIncludeMixin from "~/components/map/MapIncludeMixin"
  import {mapboxgl_lngLat2coords, place_feature2place} from "~/lib/map_utils"
  import GeocodingMixin from "~/components/map/GeocodingMixin"

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
    mixins: [AspectComponentMixin, TriggerSnackbarMixin, MapJumpMixin, MapIncludeMixin, GeocodingMixin],
    data() {
      return {
        search_query: "",
        location_marker: null,
        btn_loading_search_location: false,
        search_results: null,
        selected_search_result: undefined, // this because, clear sets it to that too,
      }
    },
    computed: {
      //  check for attr.input.___
      device_location_input_option() {
        return this.has_input_option(DEVICE)
      },
      show_map() {
        return this.is_edit_mode && this.map_location_input_option || this.is_view_mode
      },
      map_location_input_option() {
        return this.has_input_option(MAP)
      },
      search_location_input_option() {
        return this.has_input_option(SEARCH)
      },
      // this is for the MapIncludeMixin to show the control
      map_show_geolocate_ctrl() {
        return this.device_location_input_option
      },
      location_set() {
        return this.value !== null
      },
      has_place() {
        return this.location_set && this.value.place && !this.$_.isEmpty(this.value.place)
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
      }
    },
    created() {
      // if only the coordinates are set (e.g. cuz of importing from some db, this one fills in the place
      const has_coordinates = this.value && this.value.coordinates !== null
      if (this.location_set && has_coordinates && this.has_output_place && !this.has_place) {
        const place_types = this.aspect.attr.place_types || default_place_type
        const coordinates = this.value.coordinates
        this.rev_geocode(
          {lon: coordinates.lon, lat: coordinates.lat},
          {place_types}).then((data) => {
          const new_value = this.$_.cloneDeep(this.value)
          new_value.place = {}
          this.$_.forEach(data.features, feature => {
            new_value.place[feature.place_type[0]] = feature.text
          })
          this.update_value(new_value)
        }).catch((err) => {
          console.log("error: mapbox api error", err)
        }) // must be with else, cuz its async
      }
    },
    methods: {
      geolocate_success(location) {
        this.reset()
        let value = {}
        if (this.has_output_location) {
          // todo this should also be called at other situations
          if (this.aspect.attr.hasOwnProperty("apply_location_error") &&
            this.aspect.attr.apply_location_error) {
            value.coordinates = create_location_error(
              location.coords.longitude,
              location.coords.latitude,
              this.$store.state.user.user_data.location_error)
            // console.log("err.loc", value.location)
          } else {
            console.log("exact.loc")
            value.coordinates = {
              lon: location.coords.longitude,
              lat: location.coords.latitude,
            }
          }
        }
        if ((this.has_output_place)) {
          const place_types = this.aspect.attr.place_types || default_place_type
          this.rev_geocode(
            {lon: location.coords.longitude, lat: location.coords.latitude},
            {place_types}).then((data) => {
            value.place = {}
            this.$_.forEach(data.features, feature => {
              value.place[feature.place_type[0]] = feature.text
            })
            this.update_value(value)
            // this.update_value(value)
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
        this.update_value(null)
      },
      reset() {
        this.selected_search_result = undefined
        this.search_query = ""
        this.location_marker.remove()
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
      }
    },
    watch: {
      selected_search_result(sel) {
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
        if (!value) {
          this.reset()
          return
        }
        const coords = this.$_.cloneDeep(value.coordinates)
        this.map.flyTo({
          center: coords,
          essential: true // this animation is considered essential with respect to prefers-reduced-motion
        })
        if (this.location_marker) {
          this.location_marker.remove()
        }
        this.location_marker = new this.mapboxgl.Marker()
        this.location_marker.setLngLat(coords).addTo(this.map)
      }
    }
  }
</script>

<style scoped>

  .search_part {
    margin: 6px 8px;
  }

</style>
