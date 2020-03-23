<template lang="pug">
  v-layout.map.row
    client-only
      .buttongroup
        div
          v-btn(dark fab bottom right x-large color="blue" @click="drawer = !drawer")
            v-icon mdi-menu
      MapNavigationBottomSheet(
        v-if="display_mdDown"
        :drawer="drawer"
        :layers="layers"
        :navigation_mode.sync="navigation_mode"
        :selected_entry_uuid.sync="selected_entry"
        @layer_select_change="layer_select_change($event)")
      MapNavigationDrawer(
        v-else
        :drawer="drawer"
        :layers="layers"
        :navigation_mode.sync="navigation_mode"
        :selected_entry_uuid.sync="selected_entry"
        @layer_select_change="layer_select_change($event)")
      MglMap(:style="mapCssStyle"
        :access-token="accessToken"
        :map-style="mapStyle"
        @load="onMapLoaded"
        :center="center_coordinates"
        @click="touch($event)")
</template>

<script>
  import {MglMarker, MglPopup} from "vue-mapbox";
  import {access_token, licci_style_map} from "../lib/services/mapbox";
  import {MAP_GOTO_DONE, MAP_GOTO_LOCATION, MAP_RESET_GOTO_LOCATIONS, MAP_SET_ENTRIES,} from "../lib/store_consts";
  import {mapGetters} from "vuex"
  import MapNavigationDrawer from "../components/map/MapNavigationDrawer";
  import {Marker} from "mapbox-gl";
  import MapNavigationBottomSheet from "../components/map/MapNavigationBottomSheet";
  import {ENTRIES_HAS_FULL_ENTRY, ENTRIES_SAVE_ENTRY} from "../store/entries";
  import {route_change_query} from "../lib/util";


  // navigation mode!! copy of  MapNvaigationMixin
  export const SEARCH = "search"
  export const ENTRY = "entry"

  const selected_color = "#C6780A"

  export default {
    name: "Map",
    mixins: [],
    components: {MapNavigationBottomSheet, MapNavigationDrawer, MglMarker, MglPopup},
    props: {},
    layout: "map_layout",
    head() {
      return {
        link: [{
          href: "https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.0/mapbox-gl.css",
          rel: "stylesheet"
        }]
      }
    },
    data() {
      return {
        drawer: false,
        accessToken: access_token,
        mapCssStyle: "",
        mapStyle: licci_style_map,
        center_coordinates: [-0.8844128193341589, 37.809519042232694],

        // for the navigation
        navigation_mode: SEARCH,
        selected_entry: null,
        markers: [],
      }
    },
    created() {
      this.map = null
      this.$api.entries_map_entries().then(({data}) => {
        this.$store.dispatch(MAP_SET_ENTRIES, data.data)
        // console.log("received", data.data.length, "map relevant entries")
      }).catch(err => {
        console.log("map entries error")
      })
      const goto_location = this.$store.getters[MAP_GOTO_LOCATION]()
      if (goto_location) {
        this.center_coordinates = this.transform_loc(goto_location.coordinates)
      }
      console.log("map create query.select", this.$route.query.select)
      if (this.$route.query.select) {
        this.selected_entry = this.$route.query.select
        this.select_entry_marker(this.selected_entry)
        this.navigation_mode = ENTRY
      }
    },
    mounted() {
      this.mapCssStyle = "height: " + document.getElementById("fullContainer").clientHeight + "px"
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
      goto_location() {
        console.log("map, goto_location, map-store", this.$store.getters[MAP_GOTO_LOCATION]())
        return this.$store.getters[MAP_GOTO_LOCATION]()
      }
    },
    methods: {
      onMapLoaded(event) {
        this.map = event.map
        // console.log("map loaded")
        // this.map.setRenderWorldCopies(false)
        this.create_markers()
      },
      // todo later use dispatch, like in create?
      update_map_entries(entries) {
        this.$store.commit(MAP_SET_ENTRIES, entries)
      },
      layer_select_change(active_layers) {
        this.set_layer_status(this.$_.mapValues(this.$_.keyBy(this.layers), l => active_layers.includes(l)))
      },
      set_layer_status(layers = this.layer_status) {
        //console.log(this.map.style._layers)
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
      touch({mapboxEvent}) {
      },
      select_entry_marker(entry_uuid) {
        // console.log("select_entry_marker", entry_uuid)
        if (this.$store.getters[ENTRIES_HAS_FULL_ENTRY](entry_uuid)) {
          console.log("has full entry")
          if (this.selected_entry) {
            this.change_entry_markers_mode(this.selected_entry, false)
            if (entry_uuid !== this.selected_entry) {
              console.log("setting new entry")
              this.selected_entry = entry_uuid
            }
          }

          this.navigation_mode = ENTRY
          this.selected_entry = entry_uuid
          this.drawer = true
          this.change_entry_markers_mode(entry_uuid, true)

        } else {
          // console.log("grabbing entry")
          this.$api.entry__$uuid(entry_uuid).then(({data}) => {
            if (data.data) {
              if (this.selected_entry) {
                this.change_entry_markers_mode(this.selected_entry, false)
                if (entry_uuid !== this.selected_entry) {
                  // console.log("setting new entry")
                }
              }

              const entry = data.data
              this.$store.commit(ENTRIES_SAVE_ENTRY, entry)
              this.selected_entry = entry_uuid
              this.navigation_mode = ENTRY

              this.drawer = true
              this.change_entry_markers_mode(entry_uuid, true)
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
        const m = new Marker(options)
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
        // console.log(this.markers.length, "markers")
      },
      map_goto_location(location) {
        const center = this.transform_loc(location.coordinates)
        this.map.flyTo({
          center: center,
          speed: 0.8 // make the flying slow
        })
        this.$store.dispatch(MAP_GOTO_DONE)
      }
    },
    beforeRouteLeave(to, from, next) {
      this.$store.dispatch(MAP_RESET_GOTO_LOCATIONS)
      next()
    },
    watch: {
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
          this.create_markers()
        } else {
          console.log("entries, ... but no map")
        }
      },
      selected_entry(selected_uuid, previous_selected) {
        if (previous_selected) {
          this.change_entry_markers_mode(previous_selected, false)
        }
        // console.log("navigation_mode", this.navigation_mode)
        const query = {
          mode: this.navigation_mode
        }
        if(selected_uuid) {
          query.select = selected_uuid
        }
        this.$router.push(route_change_query(this.$route, query))
      },
      navigation_mode(mode) {
        if (mode === SEARCH) {
          this.selected_entry = null
        }
        this.change_entry_markers_mode(this.selected_entry, true)
      }
    }
  }
</script>

<style src="mapbox-gl/dist/mapbox-gl.css"></style>

<style>

  .buttongroup {
    top: 2%;
    left: 0.5%;
    position: fixed;
    height: 5%;
    z-index: 1
  }

  /*.article_marker {*/
  /*    background-image: url('../appbeta/icons/svgs/library-15.svg');*/
  /*    background-size: cover;*/
  /*    width: 25px;*/
  /*    height: 25px;*/
  /*    border-radius: 50%;*/
  /*    cursor: pointer;*/
  /*}*/
</style>
