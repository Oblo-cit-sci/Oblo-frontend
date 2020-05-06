<template lang="pug">
  v-layout.map
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
      mapbox(:style="mapCssStyle"
        :access-token="access_token"
        :map-options="options"
        @map-load="onMapLoaded"
        @map-zoomend="zoomend"
        @geolocate-error="geolocateError"
        @geolocate-geolocate="geolocate")
</template>

<script>

  import Mapbox from 'mapbox-gl-vue'
  import {access_token} from "~/lib/services/mapbox"
  import {MAP_GOTO_DONE, MAP_GOTO_LOCATION, MAP_SET_ENTRIES} from "~/store/map"
  import {VIEW} from "~/lib/consts"
  import {ENTRIES_HAS_FULL_ENTRY, ENTRIES_SAVE_ENTRY} from "~/store/entries"
  import {route_change_query} from "~/lib/util"
  import MapNavigationBottomSheet from "~/components/map/MapNavigationBottomSheet"
  import MapNavigationDrawer from "~/components/map/MapNavigationDrawer"
  import {mapGetters} from "vuex"

  const c_access_token = "pk.eyJ1IjoicmFtaW4zNiIsImEiOiJjamJ0eGo0cWQxbHo1MzJyMnV0bzhydjhzIn0.-q0FF4Jtuhc-wboaSA2E_A";
  const licci_style_map = "mapbox://styles/ramin36/cjx2xkz2w030s1cmumgp6y1j8";
  const mapbox_api_url = "https://api.mapbox.com/geocoding/v5/mapbox.places/";

  export const SEARCH = "search"
  export const ENTRY = "entry"
  const selected_color = "#f9992a"

  export default {
    name: "Map2",
    layout: "map_layout",
    mixins: [],
    components: {Mapbox},
    props: {},
    head() {
      return {
        link: [{
          href: "https://api.mapbox.com/mapbox-gl-js/v1.10.0/mapbox-gl.css",
          rel: "stylesheet"
        }]
      }
    },
    data() {
      return {
        access_token: c_access_token,
        options: {
          style: licci_style_map,
          center: [30, 0],
          zoom: 1
        },
        selected_coordinates: null,
        selected_place: null,
        //
        drawer: false,
        accessToken: access_token,
        mapCssStyle: "",
        mapStyle: licci_style_map,
        center_coordinates: [-0.8844128193341589, 37.809519042232694],
        map_loaded: false,
        markers: [],
      }
    },
    mounted() {
      this.mapCssStyle = "height: " + document.getElementById("fullContainer").clientHeight + "px"
    },
    created() {
      this.map = null
      this.$api.entries_map_entries().then(({data}) => {
        this.$store.dispatch(MAP_SET_ENTRIES, data.data)
        console.log("received", data.data.length, "map relevant entries")
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
      onMapLoaded(map) {
        this.map = map
        this.mapboxgl = require('mapbox-gl/dist/mapbox-gl')
        this.map_loaded = true
        console.log("map loaded")
        // console.log(this.map)
        this.map.setLayoutProperty('country-label', "visibility", "visible")
        if (this.entries) {
          this.create_markers()
          this.markers_and_map_done()
        }
        // // mapboxgl.Marker()
        setTimeout(() => {
          const marker = new this.mapboxgl.Marker().setLngLat({lon: 0, lat: 0}).addTo(map)
          marker.getElement().addEventListener("click", (e) => {
            console.log(e)
            console.log(marker.getLngLat())
            console.log(marker.getOffset())
          }, 1000)

        })
        // map.loadImage(
        //   'marker.png',
        //   function(error, image) {
        //     if (error) throw error;
        //     console.log("cat")
        //     map.addImage('cat', image);
        //     map.addSource('point', {
        //       'type': 'geojson',
        //       'data': {
        //         'type': 'FeatureCollection',
        //         'features': [
        //           {
        //             'type': 'Feature',
        //             id: 999,
        //             'geometry': {
        //               'type': 'Point',
        //               'coordinates': [0, 0]
        //             },
        //             properties: {
        //               title: "cool"
        //             }
        //           }
        //         ]
        //       }
        //     });
        //     map.addLayer({
        //       'id': 'points',
        //       'type': 'symbol',
        //       'source': 'point',
        //       'layout': {
        //         'icon-image': 'cat',
        //         'icon-size': 0.25
        //       }
        //     });
        //     map.on("click", "points", component.clicked)
        //   }
        // );
      },
      clicked(mapbox_event) {
        console.log(mapbox_event.features);
        // this.selected_coordinates = [mapbox_event.lngLat.lng, mapbox_event.lngLat.lat]
        // this.create_marker(this.selected_coordinates)
        // this.rev_geocode({lon: mapbox_event.lngLat.lng, lat: mapbox_event.lngLat.lat})
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
      rev_geocode(location, params = {
        place_types: ["country", "region", "district", "place", "locality"]
      }) {
        this.$axios.get(encodeURI(mapbox_api_url + location.lon + "," + location.lat) + ".json",
          {
            params: {
              access_token: c_access_token,
              types: params.place_types
            }
          }).then(({data}) => {
          console.log(data)
          this.selected_place = {};
          if (data.features.length === 0) { // oceans
            this.selected_place = null
          } else {
            data.features.forEach(feature => {
              this.selected_place[feature.place_type[0]] = feature.text
            })
          }
        })
      },
      create_marker(coordinates) {
        // this.map.addLayer({
        //   id: 'points',
        //   type: 'symbol',
        //   source: {
        //     type: 'geojson',
        //     data: {
        //       type: 'FeatureCollection',
        //       features: [
        //         {
        //           type: 'Feature',
        //           geometry: {
        //             type: 'Point',
        //             coordinates: [-77.03238901390978, 38.913188059745586],
        //           },
        //           properties: {
        //             title: 'Mapbox DC',
        //             icon: 'monument',
        //           },
        //         },
        //         {
        //           type: 'Feature',
        //           geometry: {
        //             type: 'Point',
        //             coordinates: [-122.414, 37.776],
        //           },
        //           properties: {
        //             title: 'Mapbox SF',
        //             icon: 'harbor',
        //           },
        //         },
        //       ],
        //     },
        //   },
        //   layout: {
        //     'icon-image': '{icon}-15',
        //     'text-field': '{title}',
        //     'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        //     'text-offset': [0, 0.6],
        //     'text-anchor': 'top',
        //   },
        // })
        console.log(this.map)
        /*     this.map.addLayer({
               id: 'points',
               type: 'symbol',
               source: {
                 type: 'geojson',
                 data: {
                   type: 'Feature',
                   geometry: {
                     type: 'Point',
                     coordinates: coordinates,
                   },
                   properties: {
                     title: 'Mapbox DC',
                     icon: 'monument',
                   },
                 }
               },
               layout: {
                 'icon-image': '{icon}-15',
                 'text-field': '{title}',
                 'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                 'text-offset': [0, 0.6],
                 'text-anchor': 'top',
               },
             });*/
      },
      // OLD MAP page
      markers_and_map_done() {
        // console.log("markers_and_map_done?")
        if (this.entries.length > 0 && this.map_loaded) {
          // console.log("markers_and_map_done")
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
        console.log("layer_select_change", active_layers)
        // console.log("all layers", this.layers)
        // debugger
        console.log(this.$_.keyBy(this.layers), l => active_layers.includes(l))
        // console.log(this.$_.mapValues(this.$_.keyBy(this.layers), l => active_layers.includes(l)))
        // console.log("**")
        this.set_layer_status(this.$_.mapValues(this.$_.keyBy(this.layers), l => active_layers.includes(l)))
      },
      set_layer_status(layers = this.layer_status) {
        // console.log("hello")
        // debugger
        // console.log(layers)
        for (let layer in layers) {
          this.map.setLayoutProperty(layer, 'visibility', layers[layer] ? "visible" : "none")
        }
      },
      transform_loc(loc) {
        // todo take the NaN check out and filter earlier...
        if (loc.hasOwnProperty("lon") && loc.lat && !isNaN(loc.lon) && !isNaN(loc.lat)) {
          return [loc.lon, loc.lat]
        } else {
          return loc
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
        // console.log("map.m.create_e_marker")
        const m = new this.mapboxgl.Marker(options)
        m.e_uuid = uuid
        m.setLngLat(coordinates).addTo(this.map)
        this.markers.push(m)
        m.getElement().addEventListener("click", () => {
          this.select_entry_marker(m.e_uuid)
        })
      },
      create_markers() {
        // console.log("creating markers from", this.entries.length, " entries")
        this.markers = []
        for (let e of this.entries) {
          for (let loc of e.location || []) {
            if (loc) {
              this.create_e_marker(loc.coordinates, e.uuid, {})
            }
          }
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
    // beforeRouteLeave(to, from, next) {
    //   this.$store.dispatch(MAP_RESET_GOTO_LOCATIONS)
    //   next()
    // },
    watch: {
      goto_location(location) {
        console.log("map goto location watch")
        if (location) {
          this.map_goto_location(location)
        }
      },
      entries() {
        // console.log("watch- entries")
        // todo, a bit ineficient. is called whenever we go back from an entry to the search
        if (this.map) {
          this.create_markers()
          this.markers_and_map_done()
        } else {
          console.log("entries, ... but no map")
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
    height: 1000px;
  }
</style>
