<template lang="pug">
  div
    div(v-if="edit")
      v-btn(v-if="device_location_input_option"
        :loading="btn_loading_device_location"
        :color="!location_set ? 'success' : ''"
        @click="device_position") from device
      v-btn(v-if="map_location_input_option"
        :color="!location_set ? 'success' : ''"
        @click="map_position") from map
      .ml-2.mt-2(v-if="search_location_input_option")
        div Location search
        v-text-field(
          v-if="!search_result_obtained"
          v-model="search_query"
          append-outer-icon="mdi-magnify"
          @click:append-outer="search_location"
          @keydown="search_keypress($event)"
          :loading="btn_loading_search_location")
        v-select(v-else :items="search_result_options"
          v-model="selected_search_result"
          item-text="place_name"
          item-value="id"
          clearable)
      div.ml-3.mb-1
        span.mr-1.font-weight-bold Result:
        span.body-1.readonly-aspect {{location_view}}
        v-btn(v-if="location_set" @click="goto_location(value, entry_uuid)")
          v-icon mdi-map-marker
    div(v-else)
      v-text-field(
        outlined
        single-line
        filled
        dense
        :readonly="true"
        :value="location_view"
        :placeholder="aspect.attr.placeholder"
        hide-details)
      v-btn(v-if="location_set" @click="goto_location(value, entry_uuid)")
        v-icon mdi-map-marker
</template>

<script>

  import {get_location, create_location_error, array2coords, place2str} from "../../lib/location";
  import AspectMixin from "./AspectMixin";
  import SingleSelect from "../input/SingleSelect";
  import {location_search, rev_geocode} from "../../lib/services/mapbox";
  import {default_place_type, MODE_ASPECT_POINT} from "../../lib/consts";
  import TriggerSnackbarMixin from "../TriggerSnackbarMixin";
  import {MAP_SET_TO_SELECT_ASPECT_LOCATION} from "../../lib/store_consts";
  import MapJumpMixin from "../MapJumpMixin";

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
    components: {SingleSelect},
    mixins: [AspectMixin, TriggerSnackbarMixin, MapJumpMixin],
    data() {
      return {
        btn_loading_device_location: false,
        search_query: "",
        btn_loading_search_location: false,
        search_result_obtained: false,
        search_result_options: null,
        selected_search_result: undefined, // this because, clear sets it to that too,
      }
    },
    computed: {
      //  check for attr.input.___
      device_location_input_option() {
        return this.has_input_option(DEVICE)
      },
      map_location_input_option() {
        return this.has_input_option(MAP)
      },
      search_location_input_option() {
        return this.has_input_option(SEARCH)
      },
      location_set() {
        return this.value !== null
      },
      has_place() {
        return this.location_set && this.value.place !== undefined
      },
      location_view() {
        if (this.has_output_place && this.has_place) {
          return place2str(this.value.place)
        } else
          return ""
      },
      //  check for attr.output.___
      has_output_location() {
        return this.has_output(LOCATION)
      },
      has_output_place() {
        return this.has_output(PLACE)
      }
    },
    created() {
      // if only the coordinates are set (e.g. cuz of importing from some db, this one fills in the place
      const has_coordinates = this.value.coordinates !== null
      if (this.location_set && has_coordinates && this.has_output_place && !this.has_place) {
        const place_types = this.aspect.attr.place_types || default_place_type
        const coordinates = this.value.coordinates
        rev_geocode(this.$axios,
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
      search_keypress(keyEvent) {
        // Enter,  this is the most robust among all platforms (desktop, mobile, chrome, ff)
        if (keyEvent.keyCode === 13) {
          this.search_location()
        }
        console.log(keyEvent)
      },
      reset_search_data() {
        this.search_result_obtained = false
        this.search_result_options = null
        this.selected_search_result = undefined
        this.search_query = ""
      },
      search_location() {
        this.btn_loading_search_location = true
        location_search(this.$axios, this.search_query, {types: default_place_type}).then(data => {
          this.btn_loading_search_location = false
          if (data.features.length === 0) {
            this.error_snackbar("No place with that name")
          } else {
            this.search_result_obtained = true
            this.search_result_options = data.features
            this.selected_search_result = this.search_result_options[0].id
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
      device_position() {
        this.btn_loading_device_location = true
        this.reset_search_data()
        get_location((location) => {
          console.log("device_position", location)
          if (location !== null) {
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
              rev_geocode(this.$axios,
                {lon: location.coords.longitude, lat: location.coords.latitude},
                {place_types}).then((data) => {
                value.place = {}
                this.$_.forEach(data.features, feature => {
                  value.place[feature.place_type[0]] = feature.text
                })
                this.update_value(value)
              }).catch((err) => {
                console.log("error: mapbox api error", err)
              }) // must be with else, cuz its async
            } else {
              this.update_value(value)
            }
          } else { // we get null, when error occured, e.g. not beeing connected
            this.error_snackbar("Could not obtain  location")
          }
          this.btn_loading_device_location = false
        })
      },
      map_position() {
        let route = {
          path: "/map",
          query: {
            mode: MODE_ASPECT_POINT,
          }
        }
        this.$store.commit(MAP_SET_TO_SELECT_ASPECT_LOCATION, this.aspect_loc)
        this.$router.push(route)
      }
    },
    watch: {
      selected_search_result(val) {
        if (val === undefined) {
          this.reset_search_data()
          this.update_value(null)
        } else {
          const feature = this.$_.find(this.search_result_options, feature => feature.id === val)
          let value = {
            coordinates: array2coords(feature.geometry.coordinates),
            place: {}
          }
          for (let place_type of feature.place_type) {
            value.place[place_type] = feature.text
          }
          for (let context of feature.context || []) {
            const place_type = context.id.split(".")[0]
            value.place[place_type] = context.text
          }
          this.update_value(value)
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
