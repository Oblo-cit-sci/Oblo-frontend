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
        :navControl="nav_control_options")
    v-list
      div(v-for="(feature, index) in features_list" :key="feature.name")
        v-list-item.my-2(style="border:1px solid #ccc; border-radius:2px;")
          v-list-item-content.pb-1
            div
              v-list-item-title.font-weight-bold {{feature.label}}
            v-btn-toggle(v-if="show_geo_type_buttons(feature.name)" :disable="!map_loaded" v-model="geo_button_selection")
              v-btn.mx-0(v-for="geo_type in allowed_geometry_types"
                :key="geo_type"
                @click="new_feature(geo_type)")
                v-icon {{get_geometry_type_icon(geo_type)}}
                span {{geo_type}}
            div
              v-list-item-content.pb-1(v-if="is_features_added(index)") {{feature_place_label(index)}}
</template>

<script>
import AspectComponentMixin from "~/components/aspects/AspectComponentMixin"
import ResponsivenessMixin from "~/components/ResponsivenessMixin"
import MapIncludeMixin from "~/components/map/MapIncludeMixin"
import Mapbox from "mapbox-gl-vue"
import {LINESTRING, POINT, POLYGON, ALL_GEOMETRY_TYPES, ENTRY, MENU_MODE_DOMAIN, DOMAIN} from "~/lib/consts"
import {arr2coords} from "~/lib/map_utils"
import {
  ADDED_LAYER,
  ADDED_LINE_LAYER,
  ADDED_SOURCE,
  CLICK, color_current_feature, color_default_added_layer, color_hover_circle,
  CURRENT_POINTS_INVISIBLE,
  CURRENT_SINGULAR_POINTS, geojson_wrap,
  MOUSEENTER,
  MOUSELEAVE,
  MOUSEMOVE, state_hover, state_mark_finish,
  TEMP_LINE_LAYER,
  TEMP_POINT_LAYER,
  TEMP_SOURCE,
  TOUCHMOVE
} from "~/components/aspect_utils/GeometryAspectConsts"
import {ADD_LAYER_TO_MAP, ADD_SOURCE_TO_MAP, BUS_MAP_LOADED} from "~/plugins/bus"

/**
 *
 * HOW TO STYLE Geometries
 * geo_features (in the aspect) can include a 'style' property.
 * that is a object, where the
 *
 */

export default {
  name: "GeometryAspect",
  mixins: [AspectComponentMixin, MapIncludeMixin, ResponsivenessMixin],
  components: {Mapbox},
  props: {},
  data() {
    return {
      geo_button_selection: null,
      // init on create, while creating a multi-point geometry it is a FeatureCollection of points
      current_feature: null,
      added_features: {
        "type": "FeatureCollection",
        "features": []
      },
      // a multipoint geometry which is drawn as points and line
      temp_points: null, // create on init
      hover_feature_id: null,
      // I need that otherwise moving to fast will "drop" the feature...
      moving_feature: false,
      // indicate new geometry (cannot use the one in use, since its POINT initially
      create_geometry: null
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
          // const this_entry = this.get_entry()
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
      // return false
      // assuming edit mode is only on the entry page
      if (this.is_editable_mode) {
        return true
      } else {
        if (this.value === null) {
          return false
        }
        // TODO TEST
        if (this.$route.name === ENTRY || this.$route.name === "test-aspects-test_GeometryAspect") {
          return true
        } else { // DOMAIN
          if (this.is_mdAndUp) {
            return false
          } else {
            return this.menu_state === MENU_MODE_DOMAIN
          }
        }
      }
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
      return this.current_feature_todo.type || ALL_GEOMETRY_TYPES
      // todo : insert:
      //       {
      //   icon: "delete",
      //   type: DELETE
      // }
    },
    min_geometries() {
      return this.attr.min || null
    },
    max_geometries() {
      return this.attr.max || null
    },
    features_list() {
      return this.aspect.geo_features || []
    },
    current_feature_todo() {
      const features = this.aspect.geo_features || []
      const added_features = this.added_features.features
      if (added_features.length < features.length) {
        return this.aspect.geo_features[added_features.length]
      }
    },
    current_feature_todo_name() {
      if (this.current_feature_todo) {
        return this.current_feature_todo.name
      }
    },
    use_default_style() {
      return this.$_.get(this.attr, "use_default_style", true)
    },
    default_style_layers() {
      return [
        {
          'id': ADDED_LAYER,
          'type': 'circle',
          'source': ADDED_SOURCE,
          paint: {
            'circle-radius': 10,
            'circle-color': ["case", ['boolean', ['feature-state', state_hover], false],
              color_hover_circle, color_default_added_layer]
          }
        },
        {
          id: ADDED_LINE_LAYER,
          type: 'line',
          source: ADDED_SOURCE,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': color_default_added_layer,
            'line-width': 3
          }
        }
      ]
    },
  },
  created() {
    // console.log("GeometryAspect created")
    // this.add_feature(this.create_point_feature([0, 0]))
    if (this.value !== null) {
      this.added_features = this.value
    }
    // console.log("geoaspect created", this.show_map, this.$route.name)

    if (!this.show_map && this.$route.name === DOMAIN) {
      if (this.$store.getters["map/is_map_loaded"]) {
        this.add_existing_data()
      } else {
        this.$bus.$on(BUS_MAP_LOADED, () => {
          this.add_existing_data()
        })
      }
    }
  },
  methods: {
    aspect_onMapLoaded(map) {
      console.log("geo-aspect onMapLoaded. show map?", this.show_map)
      if (this.show_map) {
        this.map_loaded = false
        this.onMapLoaded(map)
        this.map_loaded = false
        this.add_existing_data()
        if (this.is_editable_mode) {
          this.init_edit_layers()
          this.init_interaction_functions()
        }
        this.map_loaded = true
      }
    },
    add_existing_data() {
      this.add_source_to_map(ADDED_SOURCE, this.added_features)
      if (this.use_default_style) {
        for (let style of this.default_style_layers) {
          this.add_layer_to_map(style)
        }
      } else {
        // make sure that each feature has a style (key)
        this.add_aspect_feature_style_layer()
      }
      if (this.value) {
        this.add_existing_value()
      }
    },
    add_aspect_feature_style_layer() {
      this.features_list.forEach(feature => {
        // can be either directly the stlye or another object, with the keys ["Point",LineString",Polygon"]
        // in which case several layers are added with more filters...
        const style_keys = Object.keys(feature.style)
        if (style_keys.includes(POINT) || style_keys.includes(LINESTRING) || style_keys.includes(POLYGON)) {
          // console.log("adding style layer", feature.style)
          const added_layers = []
          const postponed_layers = []
          for (const typedStyle of Object.entries(feature.style)) {
            let g_type = typedStyle[0]
            const g_style = typedStyle[1]
            if (typeof g_style === "string") {
              postponed_layers.push(g_type)
              continue
            }
            const layer_style = {
              id: `${feature.name}_${g_type}_layer`,
              filter: ["all", ['==', 'name', feature.name], ["==", "$type", g_type]],
              source: ADDED_SOURCE
            }
            Object.assign(layer_style, g_style)
            added_layers.push(layer_style)
          }
          for (let postponed of postponed_layers) {
            const g_type = feature.style[postponed]
            const extend_layer = this.$_.find(added_layers, layer => layer.id === `${feature.name}_${g_type}_layer`)
            extend_layer.filter = ["all", ['==', 'name', feature.name], ["any", ["==", "$type", g_type], ["==", "$type", postponed]]]
          }
          for (const layer of added_layers) {
            this.add_layer_to_map(layer)
          }
        } else {
          const layer_style = {
            id: `${feature.name}_layer`,
            filter: ['==', 'name', feature.name],
            source: ADDED_SOURCE
          }

          Object.assign(layer_style, feature.style)
          console.log(layer_style)
          // TODO check if there is a 'circle-color' in style.paint and replace it with something like this:
          // from the default
          // 'circle-color': ["case", ['boolean', ['feature-state', state_hover], false],
          //         color_hover_circle, <HERE THE GIVEN COLOR>]
          this.add_layer_to_map(layer_style)
        }
      })
    },
    init_edit_layers() {
      this.map.addSource(TEMP_SOURCE, geojson_wrap(this.create_feature_collection()))
      this.map.addLayer({
        id: TEMP_POINT_LAYER,
        type: 'circle',
        source: TEMP_SOURCE,
        paint: {
          'circle-radius': 10,
          'circle-color': ["case", ['boolean', ['feature-state', state_mark_finish], false],
            color_default_added_layer, color_current_feature], // red color
        }
      })
      this.map.addLayer({
        id: TEMP_LINE_LAYER,
        type: 'line',
        source: TEMP_SOURCE,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': ["case", ['boolean', ['feature-state', state_mark_finish], false],
            color_default_added_layer, color_current_feature],
          'line-width': 3
        }
      })
      this.map.addSource(CURRENT_SINGULAR_POINTS, geojson_wrap(this.create_point_feature([])))
      this.map.addLayer({
        id: CURRENT_POINTS_INVISIBLE,
        type: 'circle',
        source: CURRENT_SINGULAR_POINTS,
        paint: {
          'circle-radius': 10,
          'circle-color': "rgba(0,0,0,0)",
        }
      })
    },
    init_interaction_functions() {
      this.map_on(MOUSEENTER, ADDED_LAYER, (e) => {
        // unhover all other features
        if (this.hover_feature_id !== null) {
          this.map.setFeatureState(
            {source: ADDED_SOURCE, id: this.hover_feature_id},
            {[state_hover]: false}
          )
        }
        this.hover_feature_id = e.features[0].id;
        this.map.setFeatureState(
          {source: ADDED_SOURCE, id: this.hover_feature_id},
          {[state_hover]: true}
        )
        this.set_map_canvas_cursor("move")
      })
      this.map_on(MOUSELEAVE, ADDED_LAYER, () => {
        if (!this.moving_feature) {
          if (this.hover_feature_id !== null) {
            this.map.setFeatureState(
              {source: ADDED_SOURCE, id: this.hover_feature_id},
              {[state_hover]: false}
            )
          }
          this.hover_feature_id = null;
          this.map.getCanvasContainer().style.cursor = '';
        }
      })
      // this.map_on(MOUSEDOWN, ADDED_LAYER, (e) => {
      //   e.preventDefault();
      //   this.set_map_canvas_cursor("grab")
      //   this.map_on(MOUSEMOVE, this._onMove)
      //   this.map_once(MOUSEUP, this._onUp)
      // })
      // this.map_on(TOUCHSTART, ADDED_LAYER, (e) => {
      //   if (e.points.length !== 1) return;
      //   e.preventDefault();
      //   this.map_on(TOUCHMOVE, this._onMove)
      //   this.map_once(TOUCHEND, this._onUp)
      // })
    },
    _onMove(e) {
      if (this.hover_feature_id) {
        const coords = e.lngLat;
        this.moving_feature = true
        this.set_map_canvas_cursor('grabbing')
        // get the feature from the added feature with the id as hover_feature_id
        const feature = this.$_.find(this.added_features.features, f => f.id === this.hover_feature_id)
        if (feature) {
          feature.geometry.coordinates = [coords.lng, coords.lat]
          this.set_data(ADDED_SOURCE, this.added_features)
        }
      }
    },
    _onUp() {
      this.moving_feature = false
      this.set_map_canvas_cursor('')
      this.map_off(MOUSEMOVE, this._onMove);
      this.map_off(TOUCHMOVE, this._onMove);
    },
    // map_click(map, mapboxEvent) {
    //   console.log("mapclick")
    //   // check if button is selected and if its the delete button
    //   if (this.geo_button_selection) {
    //     // if (GEOMETRY_ICONS[this.geo_button_selection].type === DELETE) {
    //     //   // todo check if its the layer that and the point there...
    //     //   // delete the point
    //     // }
    //   }
    // },
    // TODO Deprecated
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
    show_geo_type_buttons(feature_name) {
      return feature_name === this.current_feature_todo_name && this.is_editable_mode
    },
    feature_place_label(index) {
      console.log("label?", index, this.added_features)
      if (this.added_feature.length >= index) {
        return this.added_feature(index).properties.place
      } else {
        return this.$t("comp.geometry_asp.no_place")
      }
    },
    async add_feature(feature_orig) {
      const feature = this.$_.cloneDeep(feature_orig)
      try {
        const res = await this.rev_geocode(arr2coords(this.get_single_coordinate(feature)))
        // todo replace when point is moved
        feature.properties.place = res.features[0].place_name
      } catch (e) {
        console.log(e)
      }
      // this.current_feature_todo_name
      this.added_features.features.push(feature)
      this.update_value(this.added_features)
      this.set_data(ADDED_SOURCE, this.added_features)
    },
    /**
     * start new feature
     */
    new_feature(type) {
      if (type === POINT) {
        this.map_on(CLICK, this.point_create_click)
      } else if ([LINESTRING, POLYGON].includes(type)) {
        this.temp_points = {
          type: "Feature",
          id: this.next_feature_id(),
          properties: {},
          geometry: {
            type: POINT,
            coordinates: []
          }
        }
        this.create_geometry = type
        this.current_feature = this.create_feature_collection()
        this.map_on(MOUSEMOVE, this.linestring_create_mousemove)
        this.map_on(CLICK, this.linestring_create_click)
        this.map_on_feature_id(MOUSEENTER, CURRENT_POINTS_INVISIBLE, this.linestring_create_mouseenter)
        this.map_on_feature_id(MOUSELEAVE, CURRENT_POINTS_INVISIBLE, this.linestring_create_mouseleave)
      }
    },
    point_create_click(e) {
      console.log("point_create_click")
      e.preventDefault()
      this.add_feature(this.$_.cloneDeep(this.create_point_feature([e.lngLat.lng, e.lngLat.lat])))
      this.geo_button_selection = null
      this.map_off(CLICK, this.point_create_click)
    },
    linestring_create_mousemove(e) {
      if (this.temp_points.geometry.type === POINT) {
        this.temp_points.geometry.coordinates = [e.lngLat.lng, e.lngLat.lat]
        // console.log(this.temp_points)
        this.set_data(TEMP_SOURCE, this.temp_points)
      } else {
        const coordinates = [e.lngLat.lng, e.lngLat.lat]
        if (this.create_geometry === LINESTRING) {
          this.temp_points.geometry.coordinates.pop()
          this.temp_points.geometry.coordinates.push(coordinates)
        } else if (this.create_geometry === POLYGON) {
          console.log("poly... points", this.temp_points.geometry.coordinates[0].length)
          console.log(this.temp_points.geometry.coordinates[0])
          this.temp_points.geometry.coordinates[0].pop()
          this.temp_points.geometry.coordinates[0].pop()
          this.temp_points.geometry.coordinates[0].push(coordinates)
          this.temp_points.geometry.coordinates[0].push(this.temp_points.geometry.coordinates[0][0])
        }
        console.log("poly... points...->", this.temp_points.geometry.coordinates[0].length)
        this.set_data(TEMP_SOURCE, this.temp_points)
      }
    },
    linestring_create_click(e) {
      // console.log(e)
      e.preventDefault()
      const coordinates = [e.lngLat.lng, e.lngLat.lat]
      // if over the last point -> finish!
      if (this.map.getFeatureState({
        source: TEMP_SOURCE,
        id: this.temp_points.id
      })[state_mark_finish]) {
        // console.log("fin")
        this.add_feature(this.temp_points)
        this.create_geometry = null
        this.temp_points = null
        this.geo_button_selection = null
        this.map_off(MOUSEMOVE, this.linestring_create_mousemove)
        this.map_off(CLICK, this.linestring_create_click)
        this.map_off_feature_id(MOUSEENTER, CURRENT_POINTS_INVISIBLE, this.linestring_create_mouseenter)
        this.map_off_feature_id(MOUSELEAVE, CURRENT_POINTS_INVISIBLE, this.linestring_create_mouseleave)
        return
      }

      // add point and update current source
      this.current_feature.features.push(this.create_point_feature(coordinates))
      this.set_data(CURRENT_SINGULAR_POINTS, this.current_feature)
      // as long there is only one point, the type is still POINT, change it...
      if (this.temp_points.geometry.type === POINT) {
        console.log("turn to", this.create_geometry)
        this.temp_points.geometry.type = this.create_geometry
        if (this.create_geometry === LINESTRING) {
          this.temp_points.geometry.coordinates = []
        } else if (this.create_geometry === POLYGON) {
          this.temp_points.geometry.coordinates = [[]]
        }
      } else { // pop the moving point away (and the repeated first one for polygon)
        // console.log("pop and add new temp")
        if (this.create_geometry === LINESTRING) {
          this.temp_points.geometry.coordinates.pop()
        } else if (this.create_geometry === POLYGON) {
          this.temp_points.geometry.coordinates[0].pop()
          this.temp_points.geometry.coordinates[0].pop()
        }
        // since we are immediately inside the circle, we should set the state (as if we entered it)
        this.map.setFeatureState({
          source: TEMP_SOURCE,
          id: this.temp_points.id
        }, {[state_mark_finish]: true})
      }
      // push back temporary moving point
      if (this.create_geometry === LINESTRING) {
        this.temp_points.geometry.coordinates.push(coordinates) // new point
        this.temp_points.geometry.coordinates.push(coordinates) // moving point
      } else if (this.create_geometry === POLYGON) {
        this.temp_points.geometry.coordinates[0].push(coordinates) // new point
        this.temp_points.geometry.coordinates[0].push(coordinates) // moving point
        this.temp_points.geometry.coordinates[0].push(this.temp_points.geometry.coordinates[0][0]) // repeated first point
      }
      this.set_data(TEMP_SOURCE, this.temp_points)
    },
    linestring_create_mouseenter(e) {
      // console.log("current-feature LE", this.current_feature.features.length)
      if (this.current_feature.features.length > 1) {
        const last_temp_feature_id = this.current_feature.features[this.current_feature.features.length - 1].id
        if (e.features[0].id === last_temp_feature_id) {
          this.map.setFeatureState({
            source: TEMP_SOURCE,
            id: this.temp_points.id
          }, {[state_mark_finish]: true})
        }
      }
    },
    linestring_create_mouseleave() {
      this.map.setFeatureState({
        source: TEMP_SOURCE,
        id: this.temp_points.id
      }, {[state_mark_finish]: false})
    },
    create_point_feature(coordinates) {
      return {
        type: "Feature",
        id: this.next_feature_id(),
        properties: {},
        geometry: {
          type: POINT,
          coordinates: coordinates
        }
      }
    },
    create_feature_collection(features = []) {
      return {
        type: "FeatureCollection",
        id: this.next_feature_id(),
        properties: {},
        features: features
      }
    },
    // not used atm
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
      // console.log("added features", this.added_features.features)
      let total_le = this.added_features.features.length
      // console.log("current_feature", this.current_feature)
      if (this.current_feature) {
        total_le += this.current_feature.features.length
      }
      // console.log(this.temp_points)
      if (this.temp_points) {
        total_le += 1
      }
      return total_le
    },
    set_map_canvas_cursor(cursor) {
      this.map.getCanvasContainer().style.cursor = cursor
    },
    edit_feature(feature_id) {
      // find the feature
      const feature = this.added_features.features.find(f => f.id === feature_id)
      // if its a point set the right listener:
      if (feature.geometry.type === POINT) {
        this.map.on(CLICK, feature_id, this.edit_point_click)
      } else if (feature.geometry.type === LINESTRING) {
        this.map.on(CLICK, feature_id, this.edit_linestring_click)
        // this.map.on(MOUSEENTER, feature_id, this.edit_linestring_mouseenter)
        // this.map.on('mouseleave', feature_id, this.edit_linestring_mouseleave)
      } else if (feature.geometry.type === POLYGON) {
        // this.map.on('click', feature_id, this.edit_polygon_click)
        // this.map.on('mouseenter', feature_id, this.edit_polygon_mouseenter)
        // this.map.on('mouseleave', feature_id, this.edit_polygon_mouseleave)
      }
    },
    delete_feature(feature_id) {
      this.added_features.features = this.$_.filter(this.added_features.features, f => f.id !== feature_id)
      this.set_data(ADDED_SOURCE, this.added_features)
    },
    map_on(layer_name, function_) {
      if (this.show_map) {
        this.map.on(layer_name, function_)
      }
    },
    map_on_feature_id(layer_name, feature_id, function_) {
      if (this.show_map) {
        this.map.on(layer_name, feature_id, function_)
      }
    },
    map_off(layer_name, function_) {
      if (this.show_map) {
        this.map.off(layer_name, function_)
      }
    },
    map_off_feature_id(layer_name, feature_id, function_) {
      if (this.show_map) {
        this.map.off(layer_name, feature_id, function_)
      }
    },
    set_data(layer, data) {
      if (this.show_map) {
        this.map.getSource(layer).setData(data)
      }
    },
    /**
     *
     * @param index
     */
    is_features_added(index) {
      return this.added_features.features.length > index
    },
    added_feature(index) {
      return this.added_features.features[index]
    },
    add_existing_value() {
      // const given_features = Object.keys(this.value)
      // const named_order = this.features_list.map(f => f.name)
      // const feature_order = this.$_.sortBy(given_features, f => named_order.indexOf(f))
      // for(let feature_name of feature_order) {
      //   // const feature_name = f_name__feature[0]
      //   // const feature = f_name__feature[1]
      //   // console.log(f_name__feature)
      // }
      this.added_features = this.value
      // this.update_value(this.added_features)
      this.set_data(ADDED_SOURCE, this.added_features)
    },
    /**
     * these 2 functions do the right method depending if its the view or the entry on the main page
     * @param id
     * @param source
     */
    add_source_to_map(id, source) {
      console.log("adding source", id, source)
      if (this.$route.name === ENTRY || this.$route.name === "test-aspects-test_GeometryAspect") {
        this.map.addSource(id, geojson_wrap(source))
      } else {
        this.$bus.$emit(ADD_SOURCE_TO_MAP, id, source)
      }
    },
    add_layer_to_map(layer) {
      console.log("adding layer", layer)
      if (this.$route.name === ENTRY || this.$route.name === "test-aspects-test_GeometryAspect") {
        this.map.addLayer(layer)
      } else {
        this.$bus.$emit(ADD_LAYER_TO_MAP, layer)
      }
    },
    beforeDestroy() {
      console.log("GeometryAspect beforeDestroy")
    }
  }
}

</script>

<style scoped>

</style>
