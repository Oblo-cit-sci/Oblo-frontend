<template lang="pug">
  div
    div(v-if="edit")
      SingleSelect(:options="input_options" v-bind:selection.sync="selection")
    div(v-else)
      div No location specified
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
  import {rev_geocode} from "../../lib/services/mapbox";

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
    watch: {
      selection() {
        //console.log("selected location input method", this.selection);
        if (this.selection.value === ACTUAL_LOCATION) {
          console.log("getting location")
          get_location((location) => {
            console.log("obtained device location", location)
            const error_loc = create_location_error(
              location.coords.longitude,
              location.coords.latitude,
              this.$store.state.user.user_data.location_error)
            rev_geocode(this.$axios, {lon: location.coords.longitude, lat: location.coords.latitude}).then((data) => {
              //this.location_reverse_geo = data
              console.log(data)
            }).catch((err) => {
              console.log("error: mapbox api error", err)
            })
            this.i_value = [{value: error_loc.lon}, {value: error_loc.lat}]
            this.value_change(this.i_value)
          });
        } else if (this.selection.value === FROM_MAP) {
          //this.$emit("entryAction", {action: GLOBAL_ASPECT_REF, value: this.extra.aspect_loc})
          //console.log("emitted")
          this.$store.commit("set_mapmode", {
            select: "point",
            aspect: this.aspect.name
          })
          //console.log("loc. store edit")
          this.$router.push("/map2")
        }
      }
    },
    filters: {
      format_float(value) {
        return value.toFixed(4);
      }
    }
  }
</script>

<style scoped>

</style>
