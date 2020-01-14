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
      .search_part(v-if="search_location_input_option")
        div Location search
        v-text-field(
          v-if="!search_result_obtained"
          v-model="search_query"
          append-outer-icon="mdi-magnify"
          @click:append-outer="search_location"
          :loading="btn_loading_search_location")
        v-select(v-else :items="search_result_options"
          v-model="selected_search_result"
          item-text="place_name"
          item-value="id"
          clearable)
      v-text-field(
        outlined
        single-line
        filled
        dense
        :readonly="true"
        :value="location_view"
        :placeholder="aspect.attr.placeholder"
        hide-details)
    div(v-else)
      div No location specified
</template>

<script>

  /*

  SingleSelect(:options="input_options" v-bind:selection.sync="selection")

          span {{value[0].value | format_float}}
        span &nbsp;&nbsp;&nbsp;&nbsp;
        span Latitude:&nbsp;&nbsp;
        span {{value[1].value | format_float}}
        div Error of {{$store.state.user.user_data.location_error}} included
   */

  import {get_location, create_location_error, array2coords} from "../../lib/location";
  import AspectMixin from "./AspectMixin";
  import SingleSelect from "../SingleSelect";
  import {location_search, rev_geocode} from "../../lib/services/mapbox";

  const ACTUAL_LOCATION = "act";

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
  const default_place_type = ["place", "district", "region", "country"]

  export default {
    name: "LocationAspect",
    components: {SingleSelect},
    mixins: [AspectMixin],
    data() {
      return {
        input_options: [],
        selection: null,
        location_reverse_geo: {},
        btn_loading_device_location: false,
        search_query: "",
        btn_loading_search_location: false,
        search_result_obtained: false,
        search_result_options: null,
        selected_search_result: undefined // this because, clear sets it to that too
      }
    },
    created() {
      const select = this.aspect.attr.select || "position"
      if (select === "position") {
        this.input_options = [
          {
            text: "actual position",
            description: "Get your actual position from your GPS capable device (Switch your GPS on!)",
            value: ACTUAL_LOCATION
          }
        ]
      } else if (select === "map") {
        this.input_options = [
          {text: "point on the map", description: "", value: FROM_MAP}
        ]
      }
    },
    computed: {
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
      location_view() {
        let result = ""
        if(!this.location_set)
          return result
        if (this.has_output_place) {
          const place = this.value.place
          let result_vals = []
          for(let place_type of default_place_type) {
            if(place.hasOwnProperty(place_type)) {
              result_vals.push(place[place_type])
            }
          }
          return result_vals.join(", ")
        }
        return result
      },
      has_output_location() {
        this.has_output(LOCATION)
      },
      has_output_place() {
        return this.has_output(PLACE)
      }
    },
    filters: {
      format_float(value) {
        return value.toFixed(4);
      }
    },
    methods: {
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
          this.search_result_obtained = true
          this.search_result_options = data.features
          this.selected_search_result = this.search_result_options[0].id
        }).catch(err => {
          console.log(err)
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
          this.update_location_from_location(location)
          this.btn_loading_device_location = false
        });
      },
      update_location_from_location(location) {
        let value = {}
        if (this.has_output_location) {
          if (this.aspect.attr.hasOwnProperty("apply_location_error") &&
            this.aspect.attr.apply_location_error) {
            console.log("err.loc")
            const error_loc = create_location_error(
              location.coords.longitude,
              location.coords.latitude,
              this.$store.state.user.user_data.location_error)
            console.log(error_loc)
          } else {
            console.log("exact.loc")
            value.location = {
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
          })
        } else {
          this.update_value(value)
        }
      },
      map_position() {
        this.$store.commit("set_mapmode", {
          select: "point",
          aspect: this.aspect.name
        })
        //console.log("loc. store edit")
        this.$router.push("/map")
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
            location: array2coords(feature.geometry.coordinates),
            place: {}
          }
          for (let place_type of feature.place_type) {
            value.place[place_type] = feature.text
          }
          for(let context of feature.context || []) {
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
