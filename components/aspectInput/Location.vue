<template lang="pug">
  div
    div(v-if="edit")
      SingleSelect(:options="input_options" v-bind:selection.sync="selection")
    div(v-else)
      div No location specified
    div {{location_reverse_geo}}
</template>

<script>

  /*
          span {{i_value[0].value | format_float}}
        span &nbsp;&nbsp;&nbsp;&nbsp;
        span Latitude:&nbsp;&nbsp;
        span {{i_value[1].value | format_float}}
        div Error of {{$store.state.user.user_data.location_error}} included
   */

  import {get_location, create_location_error} from "../../lib/common";
  import AspectMixin from "./AspectMixin";
  import SingleSelect from "../SingleSelect";
  import {AUTOSAVE, GLOBAL_ASPECT_REF} from "../../lib/consts";

  const ACTUAL_LOCATION = "act";
  const FROM_MAP = "map";

  export default {
    name: "Location",
    components: {SingleSelect},
    mixins: [AspectMixin],
    data() {
      return {
        input_options: [],
        selection: null,
        location_reverse_geo: {}
      }
    },
    created() {
      console.log("location created with", this.i_value)
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
    }
    ,
    watch: {
      selection() {
        //console.log("selected location input method", this.selection);
        if (this.selection.value === ACTUAL_LOCATION) {
          console.log("getting location")
          get_location((location) => {
            //console.log("obtained device location", location)
            const error_loc = create_location_error(
              location.coords.longitude,
              location.coords.latitude,
              this.$store.state.user.user_data.location_error)
            console.log(encodeURI("https://api.mapbox.com/geocoding/v5/mapbox.places/-78.33398437500261 C50.49506928540663.json&cachebuster=1562022419854&autocomplete=true&types=country%2Cregion%2Cdistrict&language=ar"))
            let access_token = "pk.eyJ1IjoicmFtaW4zNiIsImEiOiJjamJ0eGo0cWQxbHo1MzJyMnV0bzhydjhzIn0.-q0FF4Jtuhc-wboaSA2E_A"
            this.$axios.get(encodeURI("https://api.mapbox.com/geocoding/v5/mapbox.places/" + location.coords.longitude + "," + location.coords.latitude) + ".json",
              {
                params: {
                  access_token: access_token,
                  types: ["country","region","district"]
                }
              }).then((res) => {
                this.location_reverse_geo = res.data
              var userLang = navigator.language
              console.log(userLang)
            })
            console.log(error_loc)
            this.i_value = [{value: error_loc.lon}, {value: error_loc.lat}]
            console.log("calc loc", this.i_value)
            this.value_change(this.i_value)
          });
        } else if (this.selection.value === FROM_MAP) {
          console.log("from map")
          this.$emit("entryAction", {action: GLOBAL_ASPECT_REF, value: this.aspect_ref})
          this.$emit("entryAction", {action: AUTOSAVE})
          //console.log("emitted")
          this.$store.commit("set_mapmode", {
            select: "point",
            aspect: this.aspect.name
          })
          //console.log("loc. store edit")
          this.$router.push("/map2")
        }
      }
    }
    ,
    filters: {
      format_float(value) {
        return value.toFixed(4);
      }
    }
  }
</script>

<style scoped>

</style>
