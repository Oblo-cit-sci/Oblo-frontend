<template lang="pug">
  div
    div(v-if="edit")
      SingleSelect(:options="input_options" v-bind:selection.sync="selection")
    div(v-if="i_value != null")
      span Longitude:&nbsp;&nbsp;
      span {{i_value.lon | format_float}}
      span &nbsp;&nbsp;&nbsp;&nbsp;
      span Latitude:&nbsp;&nbsp;
      span {{i_value.lat | format_float}}
      div Error of {{$store.state.user.user_data.location_error}} included
</template>

<script>

  // TODO no clue why Title_Description, does not work like for "Url".vue
  import { get_location, create_location_error} from "../../lib/common";
  import AspectMixin from "./AspectMixin";
  import Title_Description from "../Title_Description";
  import SingleSelect from "../SingleSelect";

  const ACTUAL_LOCATION = "act";
  const FROM_MAP = "map";

  export default {
    name: "Location",
    components: {SingleSelect, Title_Description},
    mixins: [AspectMixin],
    data() {
      return {
        input_options: [
          {text: "actual position", description: "Get your actual position from your GPS capable device (Switch your GPS on!)", value: ACTUAL_LOCATION},
          {text: "point on the map", description: "", value: FROM_MAP}],
        selection: null,
      }
    },
    watch: {
      selection() {
        console.log("selected location input method", this.selection);
        if (this.selection.value === ACTUAL_LOCATION) {
          get_location((location) => {
            this.i_value = create_location_error(
              location.coords.longitude,
              location.coords.latitude,
              this.$store.state.user.user_data.location_error);
              console.log(this.i_value);
              this.value_change(this.i_value);
          });
        } else if (this.selection.value === FROM_MAP) {
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
