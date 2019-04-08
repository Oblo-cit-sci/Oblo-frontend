<template lang="pug">
  div
    div {{aspect.name}}
    Selector(v-bind:options="input_options" v-bind:selection.sync="selection")
    div(v-if="Object.keys(value).length !== 0")
      span Longitude:&nbsp;&nbsp;
      span {{value.lon | format_float}}
      span &nbsp;&nbsp;&nbsp;&nbsp;
      span Latitude:&nbsp;&nbsp;
      span {{value.lat | format_float}}
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
    props: ["aspect"],
    data() {
      return {
        input_options: [
          {title: "actual position", description: "", slug: ACTUAL_LOCATION},
          {title: "point on the map", description: "", slug: FROM_MAP}],
        value: {},
        selection: null,
      }
    },
    watch: {
      selection() {
        //console.log("selected location input method", this.selection);
        if (this.selection === ACTUAL_LOCATION) {
          get_location((location) => {
            this.value = create_location_error(
              location.coords.longitude,
              location.coords.latitude,
              this.$store.state.user_data.location_error);
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
