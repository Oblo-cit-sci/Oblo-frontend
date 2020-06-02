<template lang="pug">
  client-only
    mapbox.fullSize(
      :style="map_height"
      :access-token="access_token"
      :map-options="default_map_options"
      @map-load="onMapLoaded")
</template>

<script>

  import Mapbox from 'mapbox-gl-vue'
  import MapIncludeMixin from "~/components/map/MapIncludeMixin"
  import {VIEW} from "~/lib/consts"
  import {mapGetters} from "vuex"
  import {MAP_SET_ENTRIES} from "~/store/map"
  import {LAYER_BASE_ID} from "~/lib/map_utils"



  export default {
    name: "MapWrapper",
    mixins: [MapIncludeMixin],
    components: {Mapbox},
    props: {
      height: {
        type: Number,
        default: 400
      }
    },
    data() {
      return {}
    },
    computed: {
      ...mapGetters({
        entries: "map/entries",
        layers: "map/layers",
        layer_status: "map/layer_status"
      }),
      map_height() {
        return {
          height: (this.height ? this.height : window.innerHeight) + "px"
        }
      }
    },
    created() {
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
    methods: {
      check_entries_map_done() {
        if (!this.$_.isEmpty(this.entries) && this.entries.features.length > 0 && this.map_loaded) {
          this.init_map_source_and_layers(this.entries, LAYER_BASE_ID)
          this.initialized = true
          if (this.$route.query.uuid) {
            this.update_navigation_mode(this.$route.query.uuid, VIEW)
          }
        }
      },
      init_map_source_and_layers(entries, layer_base_id) {

        console.log(this.map.style._layers)

        const source_name = layer_base_id + "_source"

        if (!this.map.getSource(source_name)) {
          console.log("adding source")
          this.map.addSource(source_name, {
            type: "geojson",
            data: entries,
            cluster: true,
            tolerance: 0,
            clusterMaxZoom: 20,
            clusterRadius: 35
          })
        } else {
          console.log("source layer exists already")
        }

        const cluster_layer_name = layer_base_id + '_clusters'
        const cluster_layer = this.map.getLayer(cluster_layer_name)

        console.log("cluster_layer?", Object.keys(this.map.style._layers).includes(cluster_layer))

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

        // this.map.on('mouseenter', entries_layer_name, (e) => {
        //   const feature = e.features[0]
        //   if (feature.properties.uuid === this.act_hoover_uuid) {
        //     return
        //   }
        //   if (this.act_popup) {
        //     this.act_popup.remove()
        //   }
        //   let coordinates = null
        //   coordinates = feature.geometry.coordinates.slice()
        //   this.act_hoover_id = feature.id
        //   // console.log(feature.id)
        //   this.map.setFeatureState(
        //     {source: source_name, id: this.act_hoover_id},
        //     {hover: true}
        //   )
        //   this.act_hoover_uuid = feature.properties.uuid
        //   // this.act_popup = new this.mapboxgl.Popup()
        //   //   .setLngLat(coordinates)
        //   //   .setText(feature.properties.title)
        //   //   .addTo(this.map)
        // })
        //
        // this.map.on('mouseleave', entries_layer_name, () => {
        //   if (this.act_hoover_uuid) {
        //     this.map.setFeatureState(
        //       {source: source_name, id: this.act_hoover_id},
        //       {hover: false}
        //     )
        //     this.act_hoover_id = null
        //     this.act_hoover_uuid = null
        //     // this.act_popup.remove()
        //     // this.act_popup = null
        //   }
        // })
        //
        // this.map.on("click", entries_layer_name, (e) => {
        //   this.select_entry_marker(e.features[0])
        // })

      },
    },
    watch: {
      map_loaded() {
        this.check_entries_map_done()
      },
      entries() {
        this.check_entries_map_done()
      }
    }
  }
</script>

<style scoped>

</style>
