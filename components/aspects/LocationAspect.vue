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
            div
              div Public location:&nbsp;
                span {{public_location_text}}
                v-chip-group(v-if="public_location_selector_on" active-class="primary--text" mandatory v-model="public_location_precision")
                  v-chip(v-for="(place_part, index) in precision_options" :key="index"
                    text-color="black"
                    color="yellow lighten-3") {{place_part}}
    div(v-else)
      span.body-1.readonly-aspect {{place_name_display}}
      v-btn(v-if="show_goto_button" icon @click="goto_location")
        v-icon mdi-map-marker
    client-only
      mapbox.crosshair.mt-3(v-if="show_map && (!readOnly || value)"
        style="height:400px"
        :access-token="access_token"
        :map-options="map_options"
        @map-load="onMapLoaded"
        @click="map_location_selected"
        navControl="is_edit_mode")
</template>

<script>

  import Mapbox from 'mapbox-gl-vue'
  import {
    array2coords,
    create_location_error,
    LOCATION_PRECISION_POINT,
    place2str,
    PREC_OPTION_EXACT,
    PREC_OPTION_RANDOM,
    PREC_OPTION_RREGION,
  } from "~/lib/location";
  import SingleSelect from "../input/SingleSelect";
  import {default_place_type} from "~/lib/consts";
  import TriggerSnackbarMixin from "../TriggerSnackbarMixin";
  import AspectComponentMixin from "./AspectComponentMixin";
  import MapIncludeMixin from "~/components/map/MapIncludeMixin"
  import {context_get_place_type, convert_to_2d_arr, mapboxgl_lngLat2coords} from "~/lib/map_utils"
  import GeocodingMixin from "~/components/map/GeocodingMixin"
  import {MAP_GOTO_LOCATION} from "~/store/map"
  import {USER_SETTINGS} from "~/store/user"
  import {mapGetters} from "vuex"
  import {settings_loc_privacy_ask, settings_loc_privacy_exact, settings_loc_privacy_random} from "~/lib/settings"

  // "attr.input" options
  const DEVICE = "device"
  const MAP = "map"
  const SEARCH = "search"

  // "attr.output" attribute defines what is readable, also what is stored
  // default both
  const LOCATION = "location" // gps location, just a icon, that shows it on the map
  const PLACE = "place" // name by the details"
  const default_output = [LOCATION, PLACE]

  export default {
    name: "LocationAspect",
    components: {SingleSelect, Mapbox},
    mixins: [AspectComponentMixin, TriggerSnackbarMixin, MapIncludeMixin, GeocodingMixin],
    data() {
      return {
        search_query: null,
        initial_autocomplete_reset: 2, // catch first 2 emit of null: ARGH
        place_part_coordinates: {},
        location_marker: null,
        btn_loading_search_location: false, // not sure if this is really effective
        search_results: null,
        selected_search_result: undefined, // this because, clear sets it to that too,
        place_select__: null, // this in v-model is only used because of https://github.com/vuetifyjs/vuetify/issues/11383
        public_location_precision: null,
        public_location_marker: null
      }
    },
    computed: {
      device_location_input_option() {
        return this.has_input_option(DEVICE)
      },
      place_name_display() {
        if (this.place_name) {
          return place_name.text
        } else {
          return ""
        }
      },
      show_map() {
        return this.$route.name !== "Map" && (this.is_edit_mode && this.map_location_input_option || this.is_view_mode)
      },
      ...mapGetters({settings: USER_SETTINGS}),
      privacy_setting() {
        return this.settings.location_privacy
      },
      public_location_text() {
        if (this.value) {
          if (this.value.location_precision === LOCATION_PRECISION_POINT) {
            if (this.privacy_setting === settings_loc_privacy_random)
              return "For viewers the exact location is not visible but randomly moved."
            else if (this.privacy_setting === settings_loc_privacy_exact) {
              return "Viewers see the exact location."
            }
          }
        } else {
          return ""
        }
      },
      public_location_selector_on() {
        return this.value && this.privacy_setting === settings_loc_privacy_ask
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
      location_privacy_setting() {
        return this.$store.getters[USER_SETTINGS].location_privacy
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
              options.push(this.value.place[place_type].name)
            }
          }
          return options
        }
      },
      precision_options() {
        return [PREC_OPTION_EXACT, PREC_OPTION_RANDOM].concat(this.place_parts)
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
        // console.log("place_name", this.value)
        if (this.value && this.value.place_name)
          return {text: this.value.place_name, value: this.value.place_name}
      },
      map_options() {
        if (this.value && this.value.coordinates) {
          return Object.assign(this.default_map_options, {
            center: this.value.coordinates,
            zoom: 3,
            interactive: !this.is_view_mode
          })
        } else {
          return this.default_map_options
        }
      },
      show_public_location() {
        if (!this.value)
          return false
        return this.value.public_precision !== PREC_OPTION_EXACT
      }
    },
    created() {
      // console.log("loc-asp create", this.value)
      if (this.value) {
        this.search_query = this.value.place_name
        this.place_select__ = this.value.place_name
        this.search_results = [
          {
            id: this.value.place_name,
            place_name: this.value.place_name,
            geometry: {coordinates: convert_to_2d_arr(this.value.coordinates)},
            place_type: [this.value.place_type],
            context: this.value.place
          }]
      }
    },
    methods: {
      geolocate_success(location) {
        console.log("geolocate_success", location)
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
          this.btn_loading_search_location = true
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
          }).finally(() => {
            setTimeout(() => {
              this.btn_loading_search_location = false
            }, 5000)
          })
        } else {
          this.update_value(value)
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
        if (this.public_location_marker) {
          this.public_location_marker.remove()
        }
      },
      search_location() {
        this.btn_loading_search_location = true
        this.geocode(this.search_query).then(data => {
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
        if (this.is_view_mode)
          return
        let value = {
          coordinates: mapboxgl_lngLat2coords(mapboxEvent.lngLat),
          place: {}
        }

        this.search_results = null
        if (this.has_output_place) {
          const coords = {lon: mapboxEvent.lngLat.lng, lat: mapboxEvent.lngLat.lat}
          this.rev_geocode(coords).then(data => {
              // console.log("q", data)
              this.querying_location = false
              if (data.features.length === 0) { // oceans
                // todo add filler
              } else {
                this.complete_value({
                  coordinates: coords,
                  location_precision: LOCATION_PRECISION_POINT,
                }, data.features)
                this.reset_public_location()
              }
            }
          ).catch((err) => {
            console.log(err)
            console.log("no location found")
            this.querying_location = false
          }).finally(() => {
            // this.update_value(value)
          })
        }
      },
      complete_value(value, features) {
        /*
        value contains just the coordinates
        features should have the results of rev-geoquery of the coordinates
         */
        // console.log("value", value)
        // console.log("features", features)
        if (!value.hasOwnProperty("place")) {
          value.place = {}
        }
        // result from rev-geocoding
        if (Array.isArray(features)) {
          for (let place_type of default_place_type) {
            const place = features.filter(c => c.place_type[0] === place_type)
            if (place.length > 0) {
              value.place[place_type] = {name: place[0].text, coordinates: array2coords(place[0].geometry.coordinates)}
            }
          }
        } else {
          value.place[features.place_type[0]] = {name: features.text, coordinates: value.coordinates}
          for (let place_type of default_place_type) {
            for (let context of features.context || []) {
              const place_type = context_get_place_type(context)
              value.place[place_type] = {name: context.text}
            }
          }
        }
        // from selecting one
        value.place_name = place2str(value.place)
        // console.log("->", value)
        if (this.privacy_setting === settings_loc_privacy_random)
          value.public = {coordinates: create_location_error(value.coordinates)}
        else if (this.privacy_setting === settings_loc_privacy_exact) {
          value.public = {coordinates: value.coordinates}
        }
        this.update_value(value)
        // this.public_location_precision = PREC_OPTION_RANDOM
      },
      update_marker(flyTo = false) {
        if (this.location_marker) {
          this.location_marker.remove()
        }
        if (this.public_location_marker) {
          this.public_location_marker.remove()
        }
        if (this.show_public_location && this.$_.get(this.value, "public_loc.coordinates")) {
          this.public_location_marker = new this.mapboxgl.Marker({
            color: "#FFF59D"
          })
          this.public_location_marker.setLngLat(this.value.public_loc.coordinates).addTo(this.map)
        }
        const coordinates = this.value.coordinates
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
      },
      reset_public_location() {
        if(this.public_location_precision === PREC_OPTION_RANDOM) {
          this.set_public_location_from_option(PREC_OPTION_RANDOM)
        }else {
          // watch will handle
          this.public_location_precision = PREC_OPTION_RANDOM
        }
      },
      set_public_location_from_option(option) {
        // console.log(option)
        const public_loc = {}
        // todo we need this?
        let public_precision = option

        if (option === PREC_OPTION_EXACT) {
          public_loc.coordinates = this.value.coordinates
          public_loc.location_precision = LOCATION_PRECISION_POINT
          public_loc.place = this.$_.cloneDeep(this.value.place)
          public_loc.place_name = place2str(public_loc.place)
        } else if (option === PREC_OPTION_RANDOM) {
          //   //const location_error = this.$store.getters["user/get_settings"].location_error
          public_loc.coordinates = create_location_error(this.value.coordinates, 2)
          public_loc.location_precision = LOCATION_PRECISION_POINT
          public_loc.place = this.$_.cloneDeep(this.value.place)
          delete public_loc.place["place"] // remove lowest resolution for privacy
          public_loc.place_name = place2str(public_loc.place)
        } else {
          public_precision = PREC_OPTION_RREGION
          public_loc.place = {}
          let add_to_place = false
          for (let place_type of default_place_type) {
            const place = this.value.place[place_type]
            // console.log(place_type, place)
            if (place) {
              if (place.name === option) {
                public_loc.location_precision = place_type
                public_loc.coordinates = place.coordinates
                add_to_place = true
              }
              if (add_to_place) {
                public_loc.place[place_type] = place
              }
            }
          }
          public_loc.place_name = place2str(public_loc.place)
        }
        this.update_value(Object.assign(this.value, {public_precision, public_loc}))
      }
    },
    watch: {
      async selected_search_result(sel) {
        console.log("selected_search_result-watch", sel, this.search_results)
        if (!sel) {
          this.update_value(null)
        } else {
          const feature = this.$_.find(this.search_results, feature => feature.id === sel)
          this.complete_value({
            coordinates: feature.geometry.coordinates,
            location_precision: feature.place_types[0],
          }, feature)
          this.reset_public_location()
          // console.log("complete")
        }
      },
      complete_value_from_features(value, features) {
        return value
      },
      value(value) {
        // console.log("location aspect value watch", value)
        if (!value) {
          this.reset()
          return
        }
        if (this.map_loaded) {
          this.update_marker(true)
        }
        // this when the value comes down as cache /or in whatever way
        if (value.place_name) {
          this.search_query = value.place_name
        }

      },
      map_loaded() {
        if (this.value && this.value.coordinates) {
          this.update_marker()
        }
      },
      public_location_precision(selection) {
        const option = this.precision_options[selection]
        this.set_public_location_from_option(option)
      }
    }
  }
</script>

<style scoped>

  .search_part {
    margin: 6px 8px;
  }

</style>
