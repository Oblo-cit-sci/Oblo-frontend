// BASIC lAYER
import MapEntriesMixin from "~/components/map/MapEntriesMixin"
import {default_place_type, ENTRY, FEATURE_COLLECTION, LINESTRING, MULTIPOINT, POINT, POLYGON} from "~/lib/consts"
import {BUS_MAP_FIT_BOUNDS, BUS_MAP_FLY_TO} from "~/plugins/bus"


export default {
  name: "MapIncludeMixin",
  mixins: [MapEntriesMixin],
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
      map_id: "la_" + this._uid,
      map_loaded: false,
      mapbox_api_url: "https://api.mapbox.com/geocoding/v5/mapbox.places/",
      default_map_options: {
        style: this.$store.getters["map/default_map_style"], //this.default_style_map,
        center: [30, 0],
        zoom: 1,
        logoPosition: "bottom-right",
        maxPitch: 0,
        dragRotate: false,
        act_hoover_id: null,
        projection: 'naturalEarth',
        minZoom: 2.5
        // scaleControl: null
      },
    }
  },
  created() {
    //dont make mapstuff reactive (putting it in data). it doesnt like it
    this.popups = []
  },
  computed: {
    access_token() {
      return this.$store.getters["map/access_token"]
    },
    language() {
      return this.$store.getters.ui_language
    },
    goto_location() {
      // console.log("map, goto_location, map-store", this.$store.getters["map/goto_location"]())
      return this.$store.getters["map/goto_location"]()
    }
  },
  methods: {
    onMapLoaded(map) {
      this.map = map
      this.mapboxgl = require('mapbox-gl/dist/mapbox-gl')
      this.mapboxgl.prewarm()
      this.map_loaded = true
      this.$emit("map", this.map)
      // todo maybe just in the options?
      if (this.map_show_geolocate_ctrl) {
        this.add_geolocate_ctrl()
      }
      // map.on('sourcedata', function (w) {
      //   // console.log('A sourcedata event occurred.',w);
      //   if (w.sourceId === "all_entries_source") {
      //     if (w.isSourceLoaded) {
      //       console.log(w)
      //       console.log(map.getSource("all_entries_source"))
      //     }
      //   }
      // });
      this.map.resize()
    },
    async rev_geocode(location, params = {
      place_types: default_place_type
    }) {
      let {data} = await this.$axios.get(encodeURI(this.mapbox_api_url + location.lon + "," + location.lat) + ".json",
        {
          params: {
            access_token: this.access_token,
            types: params.place_types,
            language: "en"
          }
        })
      return data
    },
    async geocode(search_text, params = {types: default_place_type, language: "en"}) {
      const {data} = await this.$axios.get(encodeURI(this.mapbox_api_url + search_text) + ".json",
        {
          params: Object.assign({
            access_token: this.access_token
          }, params)
        }
      )
      return data
    },
    add_geolocate_ctrl() {
      const geolocate = new this.mapboxgl.GeolocateControl({
        trackUserLocation: false,
        showUserLocation: false,
        positionOptions: {
          enableHighAccuracy: true
        },
      })
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
      // console.log("SS", this.map.getSource(source_name))
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
    add_default_entries_layer_interactions(source_name, entries_layer_name, click_method) {
      // 1. ENTRIES Hoover
      this.map.on('mouseenter', entries_layer_name, (e) => {
        const feature = e.features[0]
        this.act_hoover_id = feature.id
        this.map.setFeatureState(
          {source: source_name, id: this.act_hoover_id},
          {hover: true}
        )
        this.add_popup(feature, e, feature.properties.title)
      })
      // 2. ENTRIES Hoover leave
      this.map.on('mouseleave', entries_layer_name, () => {
        if (this.act_hoover_id !== null) {
          this.map.removeFeatureState(
            {source: source_name, id: this.act_hoover_id}, "hover")

          this.act_hoover_id = null
          this.remove_all_popups()
        }
      })
      // 3. ENTRIES click
      if (click_method) {
        this.map.on("click", entries_layer_name, e => {
          // console.log(e.features)
          click_method(e.features)
          //
        })
      }
    },
    add_cluster_layer(source_name, layer_name, paint_props) {
      this.map.addLayer({
        id: layer_name,
        type: 'circle',
        source: source_name,
        filter: ['has', 'point_count'],
        paint: paint_props
      })
    },
    templates_color_list(templates) {
      return this.$_.reduce(templates, (t_color_arr, t) => {
        t_color_arr.push(t.slug, this.$_.get(t, "rules.marker_color", "#AAAAAA"))
        return t_color_arr
      }, [])
    },
    transform_loc(loc) {
      // console.log("transform_loc", loc)
      if (Array.isArray(loc) && loc.length === 2) {
        return loc
      }
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
      let image = this.map.getCanvas().toDataURL("image/png")
        .replace("image/png", "image/octet-stream")
      let a = document.createElement('a')
      a.href = image
      a.download = "neat.png"
      a.click()
    },
    map_goto_geometry_feature_value(value) {
      // console.log("map_goto_geometry_feature_value", value)
      // todo clean location_aspect to be a geojson as well
      // console.log([POLYGON, LINESTRING, POINT].includes(value.geometry.type))
      if ([FEATURE_COLLECTION].includes(value.type)) {
        if ((value.bbox || []).length === 4) {
          this.map_fitBounds(value.bbox)
        }
      } else {
        // TODO NOT USED YET
        this.map_goto_location({coordinates: value.geometry.coordinates})
      }
    },
    map_goto_location(location) {
      // console.log("MapIncldeMixin.map_goto_location", location)
      // debugger
      const center = this.transform_loc(location.coordinates)
      console.log("map_goto_location", center)
      this.map.easeTo({
        center: center,
        duration: 2000, // make the flying slow
        padding: 400 // this.center_padding || 0// comes from the implementing class
      })
      this.$store.dispatch("map/goto_done")
    },
    map_fitBounds(bbox) {
      // todo whats this math stuff....? offset is not proper. and requires more padding
      console.log("should have offset:", this.center_padding.left || 0)
      this.map.fitBounds(new mapboxgl.LngLatBounds(bbox), {
        linear: false,
        maxZoom: 15,
        //offset: new mapboxgl.Point(-(this.center_padding.left || 0) ,0),
        padding: 400 //this.center_padding
      })
    },
    add_popup(feature, e, popup_html, remove_existing = true) {
      if (remove_existing) {
        this.remove_all_popups()
      }
      let coordinates = null
      coordinates = feature.geometry.coordinates.slice()
      // ensure correct popup position, when zoomed out and there are multiple copies
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      const popup = new this.mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(popup_html)

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
    },
    get_single_coordinate(feature) {
      // todo this will not work, if the points are spread around [-180,180] on the Lng...
      // if the feature.type is POINT just get the coordinates
      if (feature.geometry.type === POINT) {
        return feature.geometry.coordinates
      }
      // if the feature.type is POLYGON or LINESTRING, get the average of the coordinates
      const coords_array = feature.geometry.type === LINESTRING ? feature.geometry.coordinates : feature.geometry.coordinates[0]
      let point = new mapboxgl.Point(0, 0)

      const arr2p = a => new mapboxgl.Point(a[0], a[1])
      const _2arr = p => [p.x, p.y]
      if (feature.geometry.type === LINESTRING) {
        coords_array.forEach(c => point._add(arr2p(c)))
        return _2arr(point.div(coords_array.length))
      } else {
        for (let i = 0; i < coords_array.length - 1; i++) {
          point._add(arr2p(coords_array[i]))
        }
        return _2arr(point.div(coords_array.length - 1))
      }
    },
    get_geometry_type_icon(type) {
      switch (type) {
        case POINT:
          return "mdi-map-marker"
        case MULTIPOINT:
          return "mdi-map-marker-multiple"
        case LINESTRING:
          return "mdi-vector-polyline"
        case POLYGON:
          return "mdi-vector-polygon"
        default:
          logger.warn("wrong type for get_geotyype_icon", type)
          return "mdi-map-marker"
      }
    }
  },
  watch: {
    language(val) {
      // language change doesnt seem with the style
      // this.map.setLayoutProperty('country-label', 'text-field', [
      //   'get',
      //   'name_' + val
      // ])
    }
  }
}
