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
        @all_received_uuids="filter_entries($event)"
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
  import {VIEW} from "~/lib/consts"
  import {ENTRIES_GET_ENTRY, ENTRIES_HAS_FULL_ENTRY, ENTRIES_SAVE_ENTRY} from "~/store/entries"
  import {route_change_query} from "~/lib/util"
  import MapNavigationBottomSheet from "~/components/map/MapNavigationBottomSheet"
  import MapNavigationDrawer from "~/components/map/MapNavigationDrawer"
  import {mapGetters} from "vuex"
  import MapIncludeMixin from "~/components/map/MapIncludeMixin"
  import {closest_point, latLng_2_2d_arr} from "~/lib/map_utils"

  export const SEARCH = "search"
  export const ENTRY = "entry"

  export default {
    name: "Map",
    layout: "map_layout",
    mixins: [MapIncludeMixin],
    components: {Mapbox},
    props: {},
    data() {
      return {
        //
        drawer: false,
        mapCssStyle: "",

        center_coordinates: [-0.8844128193341589, 37.809519042232694],
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
          shift = this.$vuetify.breakpoint.xl ? "750px" : "600px"
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
      center_padding() {
        console.log(this.drawer)
        if(!this.drawer) {
          return {}
        }
        else if (this.display_mdDown) {
          return {bottom: 400}
        } else {
          return {
            left: this.$vuetify.breakpoint.xl ? 750 : 600
          }
        }
      },
      goto_location() {
        // console.log("map, goto_location, map-store", this.$store.getters[MAP_GOTO_LOCATION]())
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
      markers_and_map_done() {
        if (this.entries && this.entries.features.length > 0 && this.map_loaded) {
          this.create_entries_source_layer(this.entries, "all_entries")
          if (this.$route.query.uuid) {
            this.update_navigation_mode(this.$route.query.uuid, VIEW)
          }
        }
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
      select_entry_marker(feature) {
        console.log("sel", feature)
        const entry_uuid = feature.properties.uuid
        // console.log("select_entry_marker", entry_uuid)
        if (this.$store.getters[ENTRIES_HAS_FULL_ENTRY](entry_uuid)) {
          // console.log("has full entry")
          if (this.selected_entry) {
            this.change_entry_markers_mode(this.selected_entry, false)
          }
          this.update_navigation_mode(entry_uuid, VIEW, false)
          this.map_goto_location(feature.geometry)
        } else {
          // console.log("fetching entry")
          this.$api.entry__$uuid(entry_uuid).then(({data}) => {
            if (data.data) {
              if (this.selected_entry) {
                this.change_entry_markers_mode(this.selected_entry, false)
              }
              const entry = data.data

              this.$store.commit(ENTRIES_SAVE_ENTRY, entry)
              this.update_navigation_mode(entry_uuid, VIEW, false)
              this.map_goto_location(feature.geometry)
            }
          }).catch(err => {
            console.log("error fetching entry")
          })
        }
      },
      change_entry_markers_mode(entry_uuid, selected) {
        const features = this.map.getSource("all_entries_source")._data.features
        const relevant_features = this.$_.filter(features, (f) => f.properties.uuid === entry_uuid)
        for (let f of relevant_features) {
          if (selected) {
            this.map.setFeatureState(
              {source: 'all_entries_source', id: f.id},
              {"selected": true}
            )
          } else
            this.map.removeFeatureState(
              {source: 'all_entries_source', id: f.id}, "selected"
            )
        }
      },
      create_entries_source_layer(entries, layer_base_id) {
        const source_name = layer_base_id + "_source"
        // console.log("S", this.map.getSource(source_name))
        if (!this.map.getSource(source_name)) {
          console.log("adding source")
          this.map.addSource(source_name, {
            type: "geojson",
            data: entries,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 35
          })
        } else {
          console.log("source layer exists already")
        }

        const cluster_layer_name = layer_base_id + '_clusters'
        const cluster_layer = this.map.getLayer(cluster_layer_name)

        if (!cluster_layer) {
          console.log("adding cluster layer")
          this.map.addLayer({
            id: cluster_layer_name,
            type: 'circle',
            source: source_name,
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
            id: layer_base_id + '_cluster-count',
            type: 'symbol',
            source: source_name,
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12
            }
          })
        } else {
          console.log("cluster layer exists already")
        }

        const entries_layer_name = layer_base_id + '_entries'
        this.map.addLayer({
          'id': entries_layer_name,
          'type': 'circle',
          'source': source_name,
          filter: ['!', ['has', 'point_count']],
          'layout': {},
          // todo the colors should come from the templates
          'paint': {
            "circle-opacity": 1,
            'circle-color': [
              'match',
              ['get', "template"],
              'article_review',
              '#2ee70c',
              "local_observation",
              "#ee2b0b",
              '#ccc'],
            "circle-radius": [
              'case',
              ["any", ["boolean", ['feature-state', 'hover'], false], ["boolean", ['feature-state', 'selected'], false]],
              12,
              8
            ],
            "circle-stroke-color": "#f6ff7a",
            "circle-stroke-width": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              2,
              0
            ]
          }
        })

        this.map.on('mousemove', entries_layer_name, (e) => {
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
          this.act_hoover_id = feature.id
          // console.log(feature.id)
          this.map.setFeatureState(
            {source: source_name, id: this.act_hoover_id},
            {hover: true}
          )

          this.act_hoover_uuid = feature.properties.uuid
          this.act_popup = new this.mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(title)
            .addTo(this.map)
        })
        this.map.on("click", entries_layer_name, (e) => {
          this.select_entry_marker(e.features[0])
        })
        this.map.on('mouseleave', entries_layer_name, () => {
          if (this.act_hoover_uuid) {
            this.map.setFeatureState(
              {source: source_name, id: this.act_hoover_id},
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
      update_navigation_mode(entry_uuid, entry_mode, easeToFirst = true) {
        if (this.selected_entry) {
          this.change_entry_markers_mode(this.selected_entry, false)
        }
        const query = {}
        if (entry_uuid) {
          query.uuid = entry_uuid
        }
        if (entry_mode) {
          query.entry_mode = entry_mode
          this.drawer = true
          this.change_entry_markers_mode(entry_uuid, true)
          if(easeToFirst)
            this.map_goto_location(this.$store.getters[ENTRIES_GET_ENTRY](entry_uuid).location[0])
        }

        this.$router.push(route_change_query(this.$route, query, true))
      },
      filter_entries(uuids) {
        // console.log("about to filter these uuids...", uuids.length, this.entries.length)
        if (this.map_loaded && this.entries && this.entries.features.length !== uuids.length && uuids.length > 0) {
          console.log(this.entries.features.length, uuids.length === this.entries.features.length, this.map.getSource("all_entries_source"))
          // this.map.getSource("all_entries_source")
          // console.log(this.entries.features[0].properties)
          const filtered_entries = this.entries.features.filter(f => uuids.includes(f.properties.uuid))
          // console.log(uuids, filtered_entries)
          this.map.getSource("all_entries_source").setData(
            {
              type: "FeatureCollection",
              features: filtered_entries
            })
        }
      }
    },
    watch: {
      map_loaded() {
        if (this.entries) {
          this.markers_and_map_done()
        }
      },
      goto_location(location) {
        if (location) {
          this.map_goto_location(location)
        }
      },
      entries() {
        console.log("watch- entries")
        // todo, a bit ineficient. is called whenever we go back from an entry to the search
        if (this.map) {
          this.markers_and_map_done()
        } else {
          // console.log("entries, ... but no map")
        }
      },
      drawer() {
        // todo nice to have: map.easeTo with padding adjusted
      }
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
