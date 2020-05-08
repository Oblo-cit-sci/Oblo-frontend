import {MAP_GOTO_DONE} from "~/store/map"

export default {
  name: "MapIncludeMixin",
  head() {
    return {
      link: [{
        href: "mapbox-gl.css", //https://api.mapbox.com/mapbox-gl-js/v1.10.0/mapbox-gl.css",
        rel: "stylesheet"
      }]
    }
  },
  data() {
    return {
      access_token: "pk.eyJ1IjoicmFtaW4zNiIsImEiOiJjanUzdmRiaDUwcDM2M3lxYzI4a2g4NjVqIn0.SHnSFZ8clit4mcEQDSakwg",
      map_loaded: false,
      options: {
        style: "mapbox://styles/ramin36/cjx2xkz2w030s1cmumgp6y1j8", //this.default_style_map,
        center: [30, 0],
        zoom: 1
      },
    }
  },
  computed: {
    default_style_map() {
      return "mapbox://styles/ramin36/cjx2xkz2w030s1cmumgp6y1j8"
    }
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
      this.map.flyTo({
        center: center,
        speed: 0.8 // make the flying slow
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
