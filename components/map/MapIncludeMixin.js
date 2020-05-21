import {MAP_GOTO_DONE} from "~/store/map"
import MapboxBaseMixin from "~/components/map/MapboxBaseMixin"

const default_mapstyle = "mapbox://styles/ramin36/cjx2xkz2w030s1cmumgp6y1j8"

export default {
  name: "MapIncludeMixin",
  mixins: [MapboxBaseMixin],
  head() {
    return {
      link: [{
        href: "mapbox-gl.css",//https://api.mapbox.com/mapbox-gl-js/v1.10.1/mapbox-gl.css", //mapbox-gl.css", //"https://api.mapbox.com/mapbox-gl-js/v1.10.0/mapbox-gl.css", // "mapbox-gl.css"
        rel: "stylesheet"
      }]
    }
  },
  data() {
    return {
      map_loaded: false,
      default_map_options: {
        style: default_mapstyle, //this.default_style_map,
        center: [30, 0],
        zoom: 1
      },
    }
  },
  computed: {
  },
  methods: {
    onMapLoaded(map) {
      this.map = map
      this.mapboxgl = require('mapbox-gl/dist/mapbox-gl')
      this.map_loaded = true

      if (this.map_show_geolocate_ctrl) {
        this.add_geolocate_ctrl()
      }
    },
    add_geolocate_ctrl() {
      const geolocate = new this.mapboxgl.GeolocateControl()
      this.map.addControl(geolocate)
      if (this.geolocate_success) {
        geolocate.on('geolocate', this.geolocate_success)
      } else {
        console.log("Method geolocate_success missing")
      }
      if (this.geolocate_error) {
        geolocate.on('error', this.geolocate_error)
      } else {
        console.log("Method geolocate_error missing")
      }
    },
    map_goto_location(location) {
      const center = this.transform_loc(location.coordinates)
      this.map.easeTo({
        center: center,
        duration: 2000, // make the flying slow
        padding: this.center_padding // comes from the implementing class
      })
      this.$store.dispatch(MAP_GOTO_DONE)
    },
    transform_loc(loc) {
      // todo take the NaN check out and filter earlier...
      if (loc.hasOwnProperty("lon") && loc.lat && !isNaN(loc.lon) && !isNaN(loc.lat)) {
        return [loc.lon, loc.lat]
      } else {
        return loc
      }
    },
    zoomend(map, e) {
      // console.log('Map zoomed')
    },
    geolocateError(control, positionError) {
      console.log(positionError)
    },
    geolocate(control, position) {
      console.log(
        `User position: ${position.coords.latitude}, ${position.coords.longitude}`
      )
    },
  }
}
