<template lang="pug">
  div
    div(v-if="edit")
      SingleSelect(:options="input_options" v-bind:selection.sync="selection")
    div(v-else-if="i_value != null")
      span Longitude:&nbsp;&nbsp;
      span {{i_value.lon | format_float}}
      span &nbsp;&nbsp;&nbsp;&nbsp;
      span Latitude:&nbsp;&nbsp;
      span {{i_value.lat | format_float}}
      div Error of {{$store.state.user.user_data.location_error}} included
    div(v-else)
      div No location specified
</template>

<script>

  import {get_location, create_location_error} from "../../lib/common";
  import AspectMixin from "./AspectMixin";
  import Title_Description from "../Title_Description";
  import SingleSelect from "../SingleSelect";
  import {GLOBAL_ASPECT_REF} from "../../lib/consts";

  const ACTUAL_LOCATION = "act";
  const FROM_MAP = "map";

  export default {
    name: "Location",
    components: {SingleSelect, Title_Description},
    mixins: [AspectMixin],
    data() {
      return {
        input_options: [],
        selection: null,
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
    }
    ,
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
            this.i_value = {value:[{value:error_loc.lon}, {value:error_loc.lat}]}
            console.log("calc loc", this.i_value)
            this.value_change(this.i_value)
          });
        } else if (this.selection.value === FROM_MAP) {
          this.$emit("entryAction", {action:GLOBAL_ASPECT_REF, value:this.aspect_ref})
          this.$emit("entryAction", {action:"autosave"})
          console.log("emitted")
          this.$store.commit("set_mapmode", {
            select: "point",
            aspect: this.aspect.name
          })
          console.log("loc. store edit")
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
