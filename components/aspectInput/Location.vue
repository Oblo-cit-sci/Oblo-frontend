<template lang="pug">
  div
    div {{aspect.name}}
    Selector(v-bind:options="input_options" v-bind:selection.sync="selection")
    div(v-if="location")
      span Latitude:&nbsp;&nbsp;
      span {{location.coords.latitude}}
      span &nbsp;&nbsp;&nbsp;&nbsp;
      span Longitude:&nbsp;&nbsp;
      span {{location.coords.latitude}}
</template>

<script>

  import Selector from "~~/components/Selector";
  import { get_location} from "../../lib/common";

  const ACTUAL_LOCATION = "act";
  const FROM_MAP = "map";

  export default {
    name: "Location",
    components: {Selector},
    props: ["aspect"],
    data() {
      return {
        input_options: [
          {title: "actual position", description: "", slug: ACTUAL_LOCATION},
          {title: "point on the map", description: "", slug: FROM_MAP}],
        value: {},
        selection: null,
        location: null
      }
    },
    watch: {
      selection() {
        //console.log("selected location input method", this.selection);
        if (this.selection === ACTUAL_LOCATION) {
          get_location((location) => {
            console.log(location, location.coords);
            this.location = location;
          });
        } else if (this.selection === FROM_MAP) {

        }
      }
    }
  }
</script>

<style scoped>

</style>
