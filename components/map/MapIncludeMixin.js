import {MAP_GOTO_DONE} from "~/store/map"

export default {
  name: "MapIncludeMixin",
  head() {
    return {
      link: [{
        href: "mapbox-gl.css",
        rel: "stylesheet"
      }]
    }
  },
  data() {
    return {
      access_token: "pk.eyJ1IjoicmFtaW4zNiIsImEiOiJjanUzdmRiaDUwcDM2M3lxYzI4a2g4NjVqIn0.SHnSFZ8clit4mcEQDSakwg",
      map_loaded: false,
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
  }
}
