<template lang="pug">
  div
    client-only
      Mapbox.crosshair.mt-3(
        :id="map_id"
        v-if="show_map"
        style="height:400px"
        :access-token="access_token"
        :map-options="map_options"
        @map-load="aspect_onMapLoaded"
        @click="map_click"
        @dblclick="map_dbclick"
        :navControl="nav_control_options")
    v-btn-toggle(v-model="geo_button_selection")
      v-btn.mx-0(v-for="geo_type in allowed_geometry_types"
        :key="geo_type.type"
        @click="new_feature(geo_type.type)")
        v-icon {{geo_type.icon}}
        span {{geo_type.type}}
    div {{features}}
</template>

<script>
import AspectComponentMixin from "~/components/aspects/AspectComponentMixin"
import ResponsivenessMixin from "~/components/ResponsivenessMixin"
import MapIncludeMixin from "~/components/map/MapIncludeMixin"
import Mapbox from "mapbox-gl-vue"

// map-marker
// map-marker-multiple
// vector-polyline
// vector-polygon

const POINT = "Point"
const LINESTRING = "LineString"
const MULTIPOINT = "MultiPoint"
const POLYGON = "Polygon"
const DELETE = "delete"
const all_types = [POINT, LINESTRING, POLYGON]
const geometry_types = [
  {
    icon: "mdi-map-marker",
    type: POINT,
  },
  {
    icon: "mdi-map-marker-multiple",
    type: MULTIPOINT,
  },
  {
    icon: "mdi-vector-polyline",
    type: LINESTRING,
  },
  {
    icon: "mdi-vector-polygon",
    type: POLYGON,
  },
  {
    icon: "delete",
    type: DELETE
  }
]

const CURRENT_SOURCE = "current_source"
const CURRENT_LAYER = "current_layer"
const ADDED_SOURCE = "added_source"
const ADDED_LAYER = "added_layer"

const default_added_layer_circle_color = '#33796d'
const hover_circle_color = '#3bb2d0'

export default {
  name: "GeometryAspect",
  mixins: [AspectComponentMixin, MapIncludeMixin, ResponsivenessMixin],
  components: {Mapbox},
  props: {},
  data() {
    return {
      map_id: "la_" + this._uid,
      // temp
      geo_button_selection: null,
      current_feature: null,
      features: {
        "type": "FeatureCollection",
        "features": []
      },
      hover_feature_id: null,
      // I need that otherwise moving to fast will "drop" the feature...
      moving_feature: false
    }
  },
  computed: {
    map_options() {
      // console.log("map options", this.value, this.value.coordinates)
      const options = this.$_.cloneDeep(this.default_map_options)
      if (this.value && this.value.coordinates) {
        return Object.assign(options, {
          center: this.value.coordinates,
          zoom: 3,
          interactive: !this.is_view_mode,
          container: this.map_id
        })
      } else {
        // bounds from the domain
        if (this.is_editable_mode) {
          const this_entry = this.get_entry()
          const entry_domain = this.$store.getters["domain/cur_act_lang_domain_data"]()
          const domain_init_map_bounds = this.$_.get(entry_domain.map, "init_map_options.bounds")
          if (domain_init_map_bounds) {
            options.bounds = domain_init_map_bounds
          }
        }
        return Object.assign(options, {container: this.map_id})
      }
    },
    show_map() {
      return true
      // assuming edit mode is only on the entry page
      // if (this.is_editable_mode) {
      //   return true
      // } else {
      //   if (this.value === null) {
      //     return false
      //   }
      //   if (this.$route.name === ENTRY) {
      //     return true
      //   } else { // DOMAIN
      //     if (this.is_mdAndUp) {
      //       return false
      //     } else {
      //       return this.menu_state === MENU_MODE_DOMAIN
      //     }
      //   }
      // }
    },
    nav_control_options() {
      if (this.map_loaded)
        return new this.mapboxgl.NavigationControl({showZoom: this.is_editable_mode})
    },
    show_default_layers() {
      return this.$_.get(this.attr, "show_default_layers", true)
    },
    // new
    /**
     * get geometry_type from the current feature
     */
    allowed_geometry_types() {
      const allowed_type_names = this.$_.get(this.attr, "allowed_geometry_types", all_types)
      return geometry_types.filter(g => allowed_type_names.includes(g.type))
    },
    min_geometries() {
      return this.attr.min || null
    },
    max_geometries() {
      return this.attr.max || null
    },
    current_geometry_type() {
      if (this.current_feature) {
        return this.current_feature.geometry.type
      }
    }
  },
  methods: {
    aspect_onMapLoaded(map) {
      this.onMapLoaded(map)
      if (this.value) {
        this.add_layer("l1", this.value.source, this.value.layers, this.show_default_layers)
      }
      if (this.is_editable_mode) {
        this.init_edit_layers()
        this.init_interaction_functions()
      }
    },
    init_edit_layers() {
      const geojson_wrap = (data) => ({type: "geojson", data})
      this.map.addSource(ADDED_SOURCE, geojson_wrap(this.features))
      // TEST
      this.map.addLayer({
        'id': ADDED_LAYER,
        'type': 'circle',
        'source': ADDED_SOURCE,
        paint: {
          'circle-radius': 10,
          'circle-color': default_added_layer_circle_color
        }
      })
      this.map.addSource(CURRENT_SOURCE, geojson_wrap({
        type: "Feature",
        geometry: {
          type: POINT,
          coordinates: []
        }
      }))
      this.map.addLayer({
        'id': CURRENT_LAYER,
        'type': 'circle',
        'source': CURRENT_SOURCE,
        paint: {
          'circle-radius': 10,
          'circle-color': '#F84C4C' // red color
        }
      })
    },
    init_interaction_functions() {
      this.map.on('mouseenter', ADDED_LAYER, (e) => {
        if (this.hover_feature_id !== null) {
          this.map.setFeatureState(
            {source: ADDED_SOURCE, id: this.hover_feature_id},
            {hover: false}
          )
        }
        this.hover_feature_id = e.features[0].id;
        this.map.setFeatureState(
          {source: ADDED_SOURCE, id: this.hover_feature_id},
          {hover: true}
        )
        this.map.setPaintProperty(ADDED_LAYER,
          'circle-color',
          ["case", ['boolean', ['feature-state', 'hover'], false], hover_circle_color, default_added_layer_circle_color]);
        this.set_map_canvas_cursor("move")
      })

      this.map.on('mouseleave', ADDED_LAYER, (e) => {
        if(!this.moving_feature) {
          if (this.hover_feature_id !== null) {
            this.map.setFeatureState(
              {source: ADDED_SOURCE, id: this.hover_feature_id},
              {hover: false}
            )
          }
          this.hover_feature_id = null;
          this.map.getCanvasContainer().style.cursor = '';
        }
      })

      this.map.on('mousedown', ADDED_LAYER, (e) => {
        e.preventDefault();
        this.set_map_canvas_cursor("grab")
        this.map.on('mousemove', this._onMove)
        this.map.once('mouseup', this._onUp)
      })

      this.map.on('touchstart', ADDED_LAYER, (e) => {
        if (e.points.length !== 1) return;
        e.preventDefault();
        this.map.on('touchmove', this._onMove)
        this.map.once('touchend', this._onUp)
      })
    },
    _onMove(e) {
      const coords = e.lngLat;
      this.moving_feature = true
      this.set_map_canvas_cursor('grabbing')
      // get the feature from the added feature with the id as hover_feature_id
      const feature = this.$_.find(this.features.features, f => f.id === this.hover_feature_id)
      if(feature) {
        feature.geometry.coordinates = [coords.lng, coords.lat]
        console.log()
        this.map.getSource(ADDED_SOURCE).setData(this.features)
      }
    },
    _onUp(e) {
      const coords = e.lngLat
      this.moving_feature = false
      this.set_map_canvas_cursor('')
      this.map.off('mousemove', this._onMove);
      this.map.off('touchmove', this._onMove);
    },
    map_click(map, mapboxEvent) {
      // check if button is selected and if its the delete button
      if (this.geo_button_selection) {
        if (this.geometry_types[this.geo_button_selection].type === DELETE) {
          // todo check if its the layer that and the point there...
          // delete the point
          return
        }
      }
      if (this.current_feature) {
        this.add_coordinates_to_current_geometry([mapboxEvent.lngLat.lng, mapboxEvent.lngLat.lat])
      }
    },
    map_dbclick(map, mapboxEvent) {
    },
    add_layer(name, source, layers = [], show_default_layers = true) {
      this.map.addSource(name, {
        'type': 'geojson',
        'data': source
      })

      for (let layer of layers) {
        layer.source = name
        this.map.addLayer(layer)
      }

      if (show_default_layers) {
        this.map.addLayer({
          'id': name,
          'type': 'fill',
          'source': name, // reference the data source
          'layout': {},
          'paint': {
            'fill-color': "orange", // blue color fill
            'fill-opacity': 0.5
          }
        })
        this.map.addLayer({
          'id': 'outline',
          'type': 'line',
          'source': name,
          'layout': {},
          'paint': {
            'line-color': '#222',
            'line-width': 2
          }
        })
      }
    },
    // NEW
    add_feature(feature) {
      this.features.features.push(feature)
    },
    /**
     * start new feature
     */
    new_feature(type) {
      this.current_feature = {
        type: "Feature",
        id: this.next_feature_id(),
        geometry: {
          type: type,
          coordinates: []
        }
      }
    },
    add_coordinates_to_current_geometry(coordinates) {
      // add feature to the current features if it is a point
      if (this.current_geometry_type === POINT) {
        this.current_feature.geometry.coordinates = coordinates
        this.add_feature(this.$_.cloneDeep(this.current_feature))
        this.current_feature = null
        this.geo_button_selection = null
        this.map.getSource(ADDED_SOURCE).setData(this.features)
      } else {
        this.current_feature.geometry.coordinates.push(coordinates)
        this.map.getSource(CURRENT_SOURCE).setData(this.current_feature)
      }
    },
    add_circle_image(name, size = 20, fillStyle = "black", strokeStyle = null, lineWidth = 1) {
      // const pulsingDot = {
      const width = size + lineWidth
      const height = size + lineWidth
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      const radius = (size / 2);
      context.beginPath();
      context.arc(
        width / 2,
        height / 2,
        radius,
        0,
        Math.PI * 2
      );
      context.fillStyle = fillStyle
      context.fill()
      context.strokeStyle = strokeStyle
      context.lineWidth = lineWidth
      context.stroke()
      this.map.addImage(name, {
        width,
        height,
        data: context.getImageData(
          0,
          0,
          width,
          height
        ).data
      }) // , {pixelRatio: 2}
    },
    next_feature_id() {
      return this.features.features.length + 1
    },
    set_map_canvas_cursor(cursor) {
      this.map.getCanvasContainer().style.cursor = cursor
    },
  }
}
</script>

<style scoped>

</style>
