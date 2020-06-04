<template lang="pug">
  v-layout.fullSize(:style="fullHeight")
    .buttongroup(:style="button_group_shift")
      v-btn(dark fab large color="blue" @click="drawer = !drawer")
        v-icon mdi-menu
      v-btn(v-if="!drawer" fab @click="home()")
        v-icon mdi-home
    <!--    .mypopup(class="COULD BE USED IF MAPBOX POPUP STILL BEHAVES SHITTTY")-->
    component(:is="navgiagtion_component"
      :drawer="drawer"
      :layers="layers"
      :navigation_mode="navigation_mode"
      @navigation_mode_entry="navigate_entry"
      @navigation_mode_search="unselect_entry"
      @all_received_uuids="filter_entries($event)"
      @layer_select_change="layer_select_change($event)")
    client-only
      mapbox.fullSize(
        :style="fullHeight"
        :access-token="access_token"
        :map-options="default_map_options"
        @click="touch"
        @map-load="onMapLoaded"
        @geolocate-error="geolocateError"
        @render="render"
        @geolocate-geolocate="geolocate")
</template>

<script>

  import Mapbox from 'mapbox-gl-vue'

  import {MAP_GOTO_LOCATION, MAP_SET_ENTRIES} from "~/store/map"
  import {default_place_type, VIEW} from "~/lib/consts"
  import {ENTRIES_GET_ENTRY, ENTRIES_HAS_FULL_ENTRY, ENTRIES_SAVE_ENTRY} from "~/store/entries"
  import {route_change_query} from "~/lib/util"
  import MapNavigationBottomSheet from "~/components/map/MapNavigationBottomSheet"
  import MapNavigationDrawer from "~/components/map/MapNavigationDrawer"
  import {mapGetters} from "vuex"
  import MapIncludeMixin from "~/components/map/MapIncludeMixin"
  import {LAYER_BASE_ID} from "~/lib/map_utils"
  import NavBaseMixin from "~/components/NavBaseMixin"

  export const SEARCH = "search"
  export const ENTRY = "entry"

  const cluster_layer_name = LAYER_BASE_ID + '_clusters'

  async function clusterLeaves(source, cluster_id, le) {
    return await new Promise((resolve, reject) => {
      source.getClusterLeaves(cluster_id, le, 0, (err, res) => {
        if (res) {
          resolve(res)
        } else {
          reject(err)
        }
      })
    })
  }

  export default {
    name: "Map",
    layout: "map_layout",
    mixins: [MapIncludeMixin, NavBaseMixin],
    components: {Mapbox},
    props: {},
    data() {
      return {
        drawer: false,
        act_hoover_id: null,
        act_hoover_uuid: null,
        act_popup: null,
        initialized: false,
        //

        cluster_label_layer_visible: false,
        last_features_updated: []
      }
    },
    created() {
      this.map = null
      // todo domain specific
      // console.log("entries", this.entries)
      if (this.$_.isEmpty(this.entries)) {
        console.log("loading entries")
        this.$api.entries_map_entries(true).then(({data}) => {
          // console.log(data)
          this.$store.dispatch(MAP_SET_ENTRIES, data)
        }).catch(err => {
          console.log("map entries error")
        })
      }
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
      fullHeight() {
        return {
          height: window.innerHeight + "px"
        }
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
        if (!this.drawer) {
          return {}
        } else if (this.display_mdDown) {
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
      render(map) {
          if (map.getZoom() > 3.5) {
            this.cluster_label_layer_visible = true
            const clusters = this.map.queryRenderedFeatures(undefined, {layers: [cluster_layer_name]})
            this.debounced_cluster_status(clusters)
          } else {
            this.cluster_label_layer_visible = false
          }
      },
      touch(map, event) {
      },
      check_entries_map_done() {
        if (!this.$_.isEmpty(this.entries) && this.entries.features.length > 0 && this.map_loaded) {
          this.init_map_source_and_layers(this.entries, "all_entries")
          this.initialized = true
          if (this.$route.query.uuid) {
            this.update_navigation_mode(this.$route.query.uuid, VIEW)
          }
        }
      },
      async check_cluster_states(clusters) {
        const cluster_ids = clusters.map(c => c.id)

        // console.log(cluster_ids)
        if (this.$_.isEqual(this.last_features_updated, cluster_ids)) {
          return
        }
        this.last_features_updated = cluster_ids
        // console.log("debounced m", cluster_ids)
        const layer_base_id = "all_entries"
        const source_layer_name = "all_entries_source"

        const source = this.map.getSource(source_layer_name)

        const region_source_features = []

        for (let cluster of clusters) {
          const cluster_id = cluster.id
          // console.log(cluster)
          const leaves = await clusterLeaves(source, cluster_id, cluster.properties.point_count)
          const num_leaves = leaves.length
          // console.log("res", leaves)
          // let show_region = true
          // let region_name = ""
          let region_name = null
          const places = {}
          for (let pt of default_place_type) {
            places[pt] = []
          }

          for (let leave of leaves) {
            const loc = leave.properties.location[0]
            for (let pt of default_place_type) {
              if (loc.place[pt])
                places[pt].push(loc.place[pt])
            }

            for (let pt of default_place_type.slice().reverse()) {
              if (places[pt].length === num_leaves && places[pt].every(p => p === places[pt][0])) {
                region_name = places[pt][0]
              }
            }

          }
          if (region_name) {
            region_source_features.push({
              type: "Feature",
              geometry: cluster.geometry,
              properties: {region_name: region_name, orig_cluster_id: cluster_id}
            })
          }
        }

        this.map.getSource("cluster_region_names_source").setData({
          "type": "FeatureCollection",
          "features": region_source_features
        });
      },
      debounced_cluster_status() {
      },
      init_map_source_and_layers(entries, layer_base_id) {
        const source_name = layer_base_id + "_source"

        if (!this.map.getSource(source_name)) {
          console.log("adding source")
          this.map.addSource(source_name, {
            type: "geojson",
            data: entries,
            cluster: true,
            tolerance: 0,
            clusterMaxZoom: 14,
            clusterRadius: 35,
          })
        } else {
          console.log("source layer exists already")
        }

        const cluster_layer = this.map.getLayer(cluster_layer_name)

        // console.log("cluster_layer?", Object.keys(this.map.style._layers).includes(cluster_layer))

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
              "text-allow-overlap": true,
              "text-ignore-placement": true,
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 14
            }
          })

          const cluster_region_names_source = "cluster_region_names_source"
          this.map.addSource(cluster_region_names_source, {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: []
            }
          })

          this.map.addLayer({
            id: 'cluster-region-label',
            type: 'symbol',
            source: cluster_region_names_source,
            layout: {
              "text-allow-overlap": true,
              "text-ignore-placement": true,
              "text-field": ["get", "region_name"],
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              "text-offset": [0, 1],
              'text-size': 14,
              //"visibility": ["step", ["zoom"], "none", 3.5  , "visible"]
            },
            paint: {
              "text-halo-color": "#fde7a4",
              "text-halo-width": 1
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

        this.map.on('mouseenter', entries_layer_name, (e) => {
          const feature = e.features[0]
          if (feature.properties.uuid === this.act_hoover_uuid) {
            return
          }
          if (this.act_popup) {
            this.act_popup.remove()
          }
          let coordinates = null
          coordinates = feature.geometry.coordinates.slice()
          this.act_hoover_id = feature.id
          // console.log(feature.id)
          this.map.setFeatureState(
            {source: source_name, id: this.act_hoover_id},
            {hover: true}
          )
          this.act_hoover_uuid = feature.properties.uuid
          this.act_popup = new this.mapboxgl.Popup()
            .setLngLat(coordinates)
            .setText(feature.properties.title)
          this.act_popup.addTo(this.map)
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

        // this.map.on("click", entries_layer_name, (e) => {
        //   console.log(e.features)
        //   this.select_entry_marker(e.features[0])
        // })

        this.debounced_cluster_status = this.$_.debounce(this.check_cluster_states, 50)

        // this.map.on("click", cluster_layer_name, (e) => {
        //   console.log(e.features)
        //   const cluster_id = e.features[0].properties.cluster_id
        //   // console.log(cluster_id)
        //   console.log("map z", this.map.getZoom())
        //   const pointCount = e.features[0].properties.point_count;
        //   console.log(this.map.getSource("all_entries_source"))
        //   const source = this.map.getSource("all_entries_source")
        //   source.getClusterExpansionZoom(cluster_id, (error, zoom) => {
        //     console.log("z", error, zoom)
        //   })
        //
        //   source.getClusterChildren(cluster_id, (error, kids) => {
        //     console.log("c", error, kids)
        //   })
        //
        //   source.getClusterLeaves(cluster_id,pointCount,0, (error, kids) => {
        //     console.log("l", error, kids)
        //   })
        // })
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
          if (easeToFirst) {
            const entry_loc = this.$store.getters[ENTRIES_GET_ENTRY](entry_uuid).location
            if (entry_loc && entry_loc.length > 0) {
              this.map_goto_location(entry_loc[0])
            }
          }
        }
        this.$router.push(route_change_query(this.$route, query, true))
      },
      filter_entries(uuids) {
        // console.log("about to filter these uuids...", uuids.length, this.initialized)

        if (this.initialized && this.entries.features.length !== uuids.length && uuids.length > 0) {
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
        this.check_entries_map_done()
      },
      goto_location(location) {
        if (location) {
          this.map_goto_location(location)
        }
      },
      cluster_label_layer_visible(vis) {
        if(this.map) {
          this.map.setLayoutProperty("cluster-region-label", 'visibility', vis ? "visible" : "none")
        }
      },
      entries() {
        this.check_entries_map_done()
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

  .mypopup {
    top: 1%;
    right: 50px;
    width: 260px;
    max-height: 400px;
    position: fixed;
    background-color: white;
    border: solid 1px darkslategrey;
    z-index: 1
  }

  .fullSize {
    width: 100%;
  }

</style>
