<template lang="pug">
  v-layout#map
    client-only
      .buttongroup(:style="button_group_shift")
        v-btn(dark fab large color="blue" @click="drawer = !drawer")
          v-icon mdi-menu
        v-btn(v-if="!drawer" fab @click="go_home")
          v-icon mdi-home
      component(:is="navgiagtion_component"
        :drawer="drawer"
        :layers="layers"
        :navigation_mode="navigation_mode"
        @navigation_mode_entry="navigate_entry"
        @navigation_mode_search="unselect_entry"
        @layer_select_change="layer_select_change($event)")
      mapbox.crosshair(:style="mapCssStyle"
        :access-token="access_token"
        :map-options="default_map_options"
        @map-load="onMapLoaded"
        @geolocate-error="geolocateError"
        @geolocate-geolocate="geolocate")
</template>

<script>

  import Mapbox from 'mapbox-gl-vue'

  import {MAP_GOTO_LOCATION, MAP_SET_ENTRIES} from "~/store/map"
  import {default_place_type, VIEW} from "~/lib/consts"
  import {ENTRIES_HAS_FULL_ENTRY, ENTRIES_SAVE_ENTRY} from "~/store/entries"
  import {route_change_query} from "~/lib/util"
  import MapNavigationBottomSheet from "~/components/map/MapNavigationBottomSheet"
  import MapNavigationDrawer from "~/components/map/MapNavigationDrawer"
  import {mapGetters} from "vuex"
  import MapIncludeMixin from "~/components/map/MapIncludeMixin"
  import {closest_point, latLng_2_2d_arr} from "~/lib/map_utils"

  const mapbox_api_url = "https://api.mapbox.com/geocoding/v5/mapbox.places/";

  export const SEARCH = "search"
  export const ENTRY = "entry"
  const selected_color = "#f9992a"

  export default {
    name: "Map",
    layout: "map_layout",
    mixins: [MapIncludeMixin],
    components: {Mapbox},
    props: {},
    data() {
      return {
        selected_coordinates: null,
        selected_place: null,
        //
        drawer: false,
        mapCssStyle: "",

        center_coordinates: [-0.8844128193341589, 37.809519042232694],
        markers: [],
        act_hoover_id: null,
        act_hoover_uuid: null,
        act_popup: null
      }
    },
    mounted() {
      this.mapCssStyle = "height: " + document.getElementById("fullContainer").clientHeight + "px"
    },
    created() {
      this.map = null
      this.$api.entries_map_entries(true).then(({data}) => {
        console.log(data)
        this.$store.dispatch(MAP_SET_ENTRIES, data)
        // console.log("received", data.data.length, "map relevant entries")
      }).catch(err => {
        console.log("map entries error")
      })
    },
    computed: {
      ...mapGetters({
        entries: "map/entries",
        layers: "map/layers",
        layer_status: "map/layer_status"
      }),
      display_mdDown() {
        return this.$vuetify.breakpoint.mdAndDown
      },
      button_group_shift() {
        let shift = "0.5%"
        if (!this.display_mdDown && this.drawer) {
          shift = this.$vuetify.breakpoint.lgAndUp ? "600px" : "400px"
        }
        return {
          "left": shift
        }
      },
      navgiagtion_component() {
        if (this.display_mdDown)
          return MapNavigationBottomSheet
        else
          return MapNavigationDrawer
      },
      goto_location() {
        console.log("map, goto_location, map-store", this.$store.getters[MAP_GOTO_LOCATION]())
        return this.$store.getters[MAP_GOTO_LOCATION]()
      },
      navigation_mode() {
        if (this.$route.query.uuid) {
          return ENTRY
        } else
          return SEARCH
      },
      selected_entry() {
        return this.$route.query.uuid
      }
    },
    methods: {
      clicked(mapbox_event) {
        console.log(mapbox_event.features);
      },
      markers_and_map_done() {
        if (this.entries.length > 0 && this.map_loaded) {
          if (this.$route.query.uuid) {
            this.update_navigation_mode(this.$route.query.uuid, VIEW)
          }
        }
      },
      // todo later use dispatch, like in create?
      update_map_entries(entries) {
        this.$store.commit(MAP_SET_ENTRIES, entries)
      },
      layer_select_change(active_layers) {
        console.log(this.$_.keyBy(this.layers), l => active_layers.includes(l))
        this.set_layer_status(this.$_.mapValues(this.$_.keyBy(this.layers), l => active_layers.includes(l)))
      },
      set_layer_status(layers = this.layer_status) {
        for (let layer in layers) {
          this.map.setLayoutProperty(layer, 'visibility', layers[layer] ? "visible" : "none")
        }
      },
      back() {
        this.$router.back()
      },
      go_home() {
        this.$router.push("/")
      },
      touch({mapboxEvent}) {
      },
      select_entry_marker(entry_uuid) {
        // console.log("select_entry_marker", entry_uuid)
        if (this.$store.getters[ENTRIES_HAS_FULL_ENTRY](entry_uuid)) {
          // console.log("has full entry")
          if (this.selected_entry) {
            this.change_entry_markers_mode(this.selected_entry, false)
            if (entry_uuid !== this.selected_entry) {
              console.log("setting new entry")
            }
          }
          this.update_navigation_mode(entry_uuid, VIEW)
        } else {
          // console.log("fetching entry")
          this.$api.entry__$uuid(entry_uuid).then(({data}) => {
            if (data.data) {
              if (this.selected_entry) {
                this.change_entry_markers_mode(this.selected_entry, false)
              }
              const entry = data.data

              this.$store.commit(ENTRIES_SAVE_ENTRY, entry)
              // console.log("received refs", entry.entry_refs)
              this.update_navigation_mode(entry_uuid, VIEW)
            }
          }).catch(err => {
            console.log("error fetching entry")
          })
        }
      },
      change_entry_markers_mode(entry_uuid, selected) {
        // console.log("change_entry_markers_mode", entry_uuid, selected, this.selected_entry)
        const relevant_markers = this.$_.filter(this.markers, (m) => m.e_uuid === entry_uuid)
        // console.log(relevant_markers)
        for (let m of relevant_markers) {
          m.remove()
          if (selected)
            this.create_e_marker(m.getLngLat(), entry_uuid, {color: selected_color})
          else
            this.create_e_marker(m.getLngLat(), entry_uuid)
        }
      },
      create_e_marker(coordinates, uuid, options) {
        const m = new this.mapboxgl.Marker(options)
        m.e_uuid = uuid
        m.setLngLat(coordinates).addTo(this.map)
        this.markers.push(m)
        m.getElement().addEventListener("click", () => {
          this.select_entry_marker(m.e_uuid)
        })
      },
      create_entries_layer() {
        console.log("creating layers")
        if(this.map.style._layers.hasOwnProperty("all_entries_layer")) {
          return
        }
        this.map.addSource("all_entries", {
          type: "geojson",
          data: this.entries,
          generateId: true,
          cluster: true,
          clusterMaxZoom: 14, // Max zoom to cluster points on
          clusterRadius: 35 // Radius of each cluster when clustering points (defaults to 50)
        })

        this.map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'all_entries',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#f1f075',
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              10,
              3,
              15,
              10,
              20
            ]
          }
        })

        this.map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'all_entries',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
        })

        this.map.addLayer({
          'id': 'all_entries_layer',
          'type': 'circle',
          'source': 'all_entries',
          filter: ['!', ['has', 'point_count']],
          'layout': {
            // 'line-join': 'round',
            // 'line-cap': 'round'
          },
          // todo the colors should come from the templates
          'paint': {
            "circle-radius": 8,
            "circle-opacity": 1,
            'circle-color': [
              'match',
              ['get', "template"],
              'article_review',
              '#2ee70c',
              "local_observation",
              "#ee2b0b",
              '#ccc'],
            "circle-stroke-color": [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              "#ee2b0b",
              "#000000"
            ]
            // 'line-width': 8
          }
        })
        this.map.on('mousemove', 'all_entries_layer', (e) => {
          const feature = e.features[0]
          if (feature.properties.uuid === this.act_hoover_uuid) {
            return
          }
          if (this.act_popup) {
            this.act_popup.remove()
          }
          let coordinates = null
          if (feature.geometry.type === "MultiPoint") {
            const cursor_loc = latLng_2_2d_arr(e.lngLat)
            coordinates = closest_point(cursor_loc, feature.geometry.coordinates)
          } else {
            coordinates = feature.geometry.coordinates.slice()
          }
          var title = feature.properties.title
          // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          //   coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          // }

          this.act_hoover_id = feature.id
          // console.log(feature.id)
          this.map.setFeatureState(
            {source: 'all_entries', id: this.act_hoover_id},
            {hover: true}
          )

          this.act_hoover_uuid = feature.properties.uuid
          this.act_popup = new this.mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(title)
            .addTo(this.map)
        })

        this.map.on("click", "all_entries_layer", (e) => {
          this.select_entry_marker(e.features[0].properties.uuid)
        })

        this.map.on('mouseleave', 'all_entries_layer', () => {
          if (this.act_hoover_uuid) {
            this.map.setFeatureState(
              {source: 'all_entries', id: this.act_hoover_id},
              {hover: false}
            )
            this.act_hoover_id = null
            this.act_hoover_uuid = null
            this.act_popup.remove()
            this.act_popup = null
          }
        })
      },
      navigate_entry({uuid, mode}) {
        this.update_navigation_mode(uuid, mode)
      },
      unselect_entry() {
        this.update_navigation_mode(null)
      },
      update_navigation_mode(entry_uuid, entry_mode) {
        if (this.selected_entry) {
          this.change_entry_markers_mode(this.selected_entry, false)
        }
        // this.select_entry_marker(entry_uuid)
        // console.log("selected_entry", entry_uuid)
        const query = {}
        // console.log("navigation_mode", this.navigation_mode)
        if (entry_uuid) {
          query.uuid = entry_uuid
        }
        if (entry_mode) {
          query.entry_mode = entry_mode
          this.drawer = true
        }
        this.change_entry_markers_mode(entry_uuid, true)
        this.$router.push(route_change_query(this.$route, query, true))
      }
    },
    watch: {
      map_loaded() {
        if (this.entries) {
          this.create_entries_layer()
          this.markers_and_map_done()
        }
//         this.map.addSource('ethnicity', {
//           type: 'vector',
//           url: 'mapbox://examples.8fgz4egr'
//         });
//         this.map.addLayer({
//           'id': 'population',
//           'type': 'circle',
//           'source': 'ethnicity',
//           'source-layer': 'sf2010',
//           'paint': {
// // make circles larger as the user zooms from z12 to z22
//             'circle-radius': {
//               'base': 1.75,
//               'stops': [
//                 [12, 2],
//                 [22, 180]
//               ]
//             },
// color circles by ethnicity, using a match expression
// https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
//             'circle-color': [
//               'match',
//               ['get', 'ethnicity'],
//               'White',
//               '#fbb03b',
//               'Black',
//               '#223b53',
//               'Hispanic',
//               '#e55e5e',
//               'Asian',
//               '#3bb2d0',
//               /* other */ '#ccc'
//             ]
//           }
//         })

      },
      goto_location(location) {
        console.log("map goto location watch")
        if (location) {
          this.map_goto_location(location)
        }
      },
      entries() {
        console.log("watch- entries")
        // todo, a bit ineficient. is called whenever we go back from an entry to the search
        if (this.map) {
          this.create_entries_layer()
          this.markers_and_map_done()
        } else {
          // console.log("entries, ... but no map")
        }
      },
    }
  }
</script>

<style scoped>

  .buttongroup {
    top: 2%;
    transition: left 0.2s;
    transition-timing-function: ease-out;
    position: fixed;
    height: 5%;
    z-index: 1
  }

  #map {
    width: 100%;
  }

  .crosshair {
    cursor: crosshair !important;
  }
</style>
