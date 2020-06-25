<template lang="pug">
  .fullsize
    .buttons
      v-btn(fab @click="set_dl=true" x-small dark)
        v-icon mdi-camera
    client-only
      mapbox.fullSize(
        :style="map_height"
        :access-token="access_token"
        :map-options="map_options"
        @render="render"
        @map-load="onMapLoaded")
</template>

<script>

  import Mapbox from 'mapbox-gl-vue'
  import MapIncludeMixin from "~/components/map/MapIncludeMixin"
  import {VIEW} from "~/lib/consts"
  import {mapGetters} from "vuex"
  import DomainMapMixin from "~/components/map/DomainMapMixin"
  import {TEMPLATES_OF_DOMAIN} from "~/store/templates"
  import {ENTRIES_HAS_FULL_ENTRY, ENTRIES_SAVE_ENTRY} from "~/store/entries"
  import HasMainNavComponentMixin from "~/components/global/HasMainNavComponentMixin"
  import {MAP_GOTO_LOCATION} from "~/store/map"

  export default {
    name: "MapWrapper",
    mixins: [MapIncludeMixin, DomainMapMixin, HasMainNavComponentMixin],
    components: {Mapbox},
    props: {
      height: {
        type: [String, Number],
        default: 400
      },
      search_time: {
        type: Date
      }
    },
    data() {
      return {
        act_popup: null,
        act_hoover_uuid: null,
        set_dl: false
      }
    },
    computed: {
      ...mapGetters({
        entries_loaded: "map/entries_loaded",
        all_map_entries: "map/entries",
        layers: "map/layers",
        layer_status: "map/layer_status",
        legend_selection: "map/get_filter_config"
      }),
      entries() {
        return this.all_map_entries(this.domain)
      },
      map_height() {
        return {
          height: (this.height ? this.height : window.innerHeight) + (typeof (this.height) === "number" ? "px" : "")
        }
      },
      templates_color_list() {
        const templates = this.$store.getters[TEMPLATES_OF_DOMAIN](this.domain)
        // console.log(templates)
        let template_color_arr = []
        for (let temp of templates) {
          if (temp.rules.map) {
            template_color_arr.push(temp.slug)
            template_color_arr.push(temp.rules.map.marker_color)
          }
        }
        return template_color_arr
      },
      map_options() {
        const default_camera = this.$_.get(this.$store.getters["domain_by_name"](this.domain), "map.default_camera")
        let options = this.$_.cloneDeep(this.default_map_options)
        if (default_camera) {
          Object.assign(options, default_camera)
        }
        const cached_options = this.$store.getters["map/cached_camera_options"](this.domain)
        if (cached_options) {
          Object.assign(options, cached_options)
        }
        return options
      },
      display_mdDown() {
        return this.$vuetify.breakpoint.mdAndDown
      },
      center_padding() {
        if (!this.nav_drawer) {
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
      }
    },
    created() {
      // console.log("wrapper created")
      if (this.domain) {
        this.load_map_entries()
      }
    },
    beforeDestroy() {
      // todo consider padding from menu
      if (this.map) {
        this.$store.commit("map/set_camera_options_cache", {
          domain: this.domain, options: {
            zoom: this.map.getZoom(),
            center: this.map.getCenter()
          }
        })
      }
    },
    methods: {
      trigger_dl() {
        this.set_dl=true
        this.map.triggerRepaint()
      },
      render(re) {
        if(!this.set_dl)
          return
        this.set_dl = false
        // console.log(re)
        let image = re.getCanvas().toDataURL("image/png")
          .replace("image/png", "image/octet-stream")
        let a = document.createElement('a')
        a.href = image
        a.download = "neat.png"
        a.click()
      },
      check_entries_map_done() {
        // console.log("check_entries_map_done", this.entries)
        if (this.entries_loaded && this.entries.features.length > 0 && this.map_loaded) {
          this.init_map_source_and_layers()
          this.initialized = true
          if (this.$route.query.uuid) {
            this.update_navigation_mode(this.$route.query.uuid, VIEW)
            this.change_entry_markers_mode(this.$route.query.uuid, true)
          }
        }
      },
      init_map_source_and_layers(layer_base_id = "all_entries") {
        // add source
        // console.log(this.entries.features.length)

        // const all_entries_source_name = layer_base_id + "_all_source"
        // if (!this.map.getSource(all_entries_source_name)) {
        //   // console.log("adding source")
        //   this.map.addSource(all_entries_source_name, {
        //     type: "geojson",
        //     data: this.entries,
        //     cluster: true,
        //     tolerance: 0,
        //     clusterMaxZoom: 14,
        //     clusterRadius: 35,
        //     generateId: true
        //   })
        // } else {
        //   console.log("source layer exists already")
        // }

        const source_name = layer_base_id + "_source"
        this.update_filtered_source()

        // cluster layer
        const cluster_layer_name = layer_base_id + '_clusters'
        const cluster_layer = this.map.getLayer(cluster_layer_name)
        // console.log("cluster_layer?", Object.keys(this.map.style._layers).includes(cluster_layer))
        if (!cluster_layer) {
          // console.log("adding cluster layer")
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

          // 2nd cluster count layer
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
        } else {
          console.log("cluster layer exists already")
        }

        // entries layer
        const entries_layer_name = layer_base_id + '_entries'
        this.map.addLayer({
          'id': entries_layer_name,
          'type': 'circle',
          'source': source_name,
          filter: ['!', ['has', 'point_count']],
          'layout': {},
          // todo the colors should come from the templates
          'paint': {
            'circle-color': [
              'match',
              ['get', "template"],
              ...this.templates_color_list,
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

        // Interactions
        // 1. ENTRIES Hoover
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
          // ensure correct popup position, when zoomed out and there are multiple copies
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

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

        // Interactions
        // 1. ENTRIES Hoover leave
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
        this.map.on("click", entries_layer_name, (e) => {
          // console.log(e.features)
          this.select_entry_marker(e.features[0])
        })
      },
      update_filtered_source() {
        const included_templates = this.legend_selection.map(s => s.value)
        const filtered_entries = {
          type: "FeatureCollection",
          features: this.entries.features.filter(e => included_templates.includes(e.properties.template))
        }
        if (!this.map.getSource("all_entries_source")) {
          this.map.addSource("all_entries_source", {
            type: "geojson",
            data: filtered_entries,
            cluster: true,
            tolerance: 0,
            clusterMaxZoom: 14,
            clusterRadius: 15,
            generateId: true
          })
        } else {
          this.map.getSource("all_entries_source").setData(filtered_entries)
        }
      },
      select_entry_marker(feature) {
        // console.log("select_entry_marker")
        const entry_uuid = feature.properties.uuid
        // console.log("select_entry_marker", entry_uuid)
        if (this.$store.getters[ENTRIES_HAS_FULL_ENTRY](entry_uuid)) {
          this.update_navigation_mode(entry_uuid, VIEW, false)
          // this.map_goto_location(feature.geometry)
        } else {
          // console.log("fetching entry")
          this.$api.entry__$uuid(entry_uuid).then(({data}) => {
            if (data.data) {
              const entry = data.data
              this.$store.commit(ENTRIES_SAVE_ENTRY, entry)
              this.update_navigation_mode(entry_uuid, VIEW, false)
              // this.map_goto_location(feature.geometry)
            }
          }).catch(err => {
            console.log("error fetching entry")
          })
        }
      },
      change_entry_markers_mode(entry_uuid, selected) {
        // console.log("MapWrapper.change_entry_markers_mode")
        const features = this.map.getSource("all_entries_source")._data.features
        // console.log("all features", features)
        const relevant_features = this.$_.filter(features, (f) => f.properties.uuid === entry_uuid)
        // console.log(entry_uuid, selected)
        // this.map.setLayoutProperty(
        //   "all_entries_cluster-count",
        //   'visibility',
        //   selected ? 'none' : 'visible'
        // )
        for (let f of relevant_features) {
          if (selected) {
            this.map.setFeatureState(
              {source: 'all_entries_source', id: f.id},
              {"selected": true}
            )
          } else {
            this.map.removeFeatureState(
              {source: 'all_entries_source', id: f.id}, "selected")
          }
        }
      },
    },
    watch: {
      map_loaded() {
        this.check_entries_map_done()
        this.$emit("map", this.map)
      },
      entries_loaded(loaded) {
        // console.log("entries loaded", loaded)
        if (loaded)
          this.check_entries_map_done()
      },
      selected_entry(uuid, old_uuid) {
        // console.log("MapWrapper.watch.selected_entry", uuid, old_uuid)
        if (old_uuid) {
          this.change_entry_markers_mode(old_uuid, false)
        }
        if (uuid) {
          this.change_entry_markers_mode(uuid, true)
          this.$emit("force_menu_mode_domain")
        }
      },
      goto_location(location) {
        // console.log("MapWrapper.watch.goto_location")
        if (location) {
          this.map_goto_location(location)
        }
      },
      legend_selection(selection) {
        this.update_filtered_source()
      }
    }
  }
</script>

<style scoped>
  .buttons {
    position: absolute;
    top: 2%;
    z-index: 1;
    left: 13%;
    transform: translate(-50%, 0)
  }

  .fullsize {
    width: 100%;
    height: 100%;
  }
</style>
