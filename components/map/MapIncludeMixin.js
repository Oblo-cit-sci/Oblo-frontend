import {MAP_GOTO_DONE} from "~/store/map"
import MapboxBaseMixin from "~/components/map/MapboxBaseMixin"

const default_mapstyle = "mapbox://styles/ramin36/cjx2xkz2w030s1cmumgp6y1j8"

export default {
  name: "MapIncludeMixin",
  mixins: [MapboxBaseMixin],
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
      map_loaded: false,
      default_map_options: {
        style: default_mapstyle, //this.default_style_map,
        center: [30, 0],
        zoom: 1,
        logoPosition: "bottom-right",
        maxPitch: 0,
        dragRotate: false,
        // scaleControl: null
      },
    }
  },
  created() {
    //dont make mapstuff reactive (putting it in data). it doesnt like it
    this.popups = []
  },
  computed: {
    language() {
      return this.$store.getters["app/ui_language"]
    }
  },
  methods: {
    onMapLoaded(map) {
      this.map = map
      this.mapboxgl = require('mapbox-gl/dist/mapbox-gl')
      this.mapboxgl.prewarm()
      this.map_loaded = true

      if (this.map_show_geolocate_ctrl) {
        this.add_geolocate_ctrl()
      }
      this.map.resize()
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
    add_entry_layer(source_name, layer_name, paint_props) {
      this.map.addLayer({
        'id': layer_name,
        'type': 'circle',
        'source': source_name,
        filter: ['!', ['has', 'point_count']],
        'layout': {},
        // todo the colors should come from the templates
        'paint': Object.assign({}, paint_props)
      })
    },
    templates_color_list(templates) {
      return this.$_.reduce(templates, (t_color_arr, t) => {
        t_color_arr.push(t.slug, this.$_.get(t, "rules.map.marker_color", "#AAAAAA"))
        return t_color_arr
      }, [])
    },
    map_goto_location(location) {
      // console.log("MapIncldeMixin.map_goto_location", location)
      // debugger
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
    download_image() {
      // doesnt contain the marker yet
      debugger
      let image = this.map.getCanvas().toDataURL("image/png")
        .replace("image/png", "image/octet-stream")
      let a = document.createElement('a')
      a.href = image
      a.download = "neat.png"
      a.click()
    },
    add_popup(popup) {
      popup.addTo(this.map)
      this.popups.push(popup)
      return this.popups.length
    },
    remove_popup(index) {
      const popup = this.$_.get(this.popup, index)
      if (popup) {
        popup.remove()
        this.poups.splice(index, 1)
      } else {
        console.log("warning. wrong popup index. out of bounds", index, this.popups.length)
      }
    },
    remove_all_popups() {
      for (let popup of this.popups) {
        popup.remove()
      }
      this.popups = []
    }
  },
  watch: {
    language(val) {
      this.map.setLayoutProperty('country-label', 'text-field', [
        'get',
        'name_' + val
      ])
    }
  }
}
