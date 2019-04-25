<template lang="pug">
  div
    h3 {{aspect.name}}
    div(v-if="edit")
      Selector(v-bind:options="input_options" v-bind:selection.sync="selection")
    div(v-if="i_value != null")
      span Longitude:&nbsp;&nbsp;
      span {{i_value.lon | format_float}}
      span &nbsp;&nbsp;&nbsp;&nbsp;
      span Latitude:&nbsp;&nbsp;
      span {{i_value.lat | format_float}}
      div Error of {{$store.state.user_data.location_error}} included
</template>

<script>

  import Selector from "~~/components/Selector";
  import { get_location, create_location_error} from "../../lib/common";
  import AspectMixin from "./AspectMixin";

  const ACTUAL_LOCATION = "act";
  const FROM_MAP = "map";

  export default {
    name: "Location",
    components: {Selector},
    mixins: [AspectMixin],
    data() {
      return {
        input_options: [
          {title: "actual position", description: "", slug: ACTUAL_LOCATION},
          {title: "point on the map", description: "", slug: FROM_MAP}],
        selection: null,
      }
    },
    watch: {
      selection() {
        //console.log("selected location input method", this.selection);
        if (this.selection.slug === ACTUAL_LOCATION) {
          get_location((location) => {
            this.i_value = create_location_error(
              location.coords.longitude,
              location.coords.latitude,
              this.$store.state.user_data.location_error);
              console.log(this.i_value);
              this.value_change(this.i_value);
          });
        } else if (this.selection === FROM_MAP) {

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
