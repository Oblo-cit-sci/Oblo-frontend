<template lang="pug">
  .fullSize
    <!--      .buttons-->
    <!--        v-btn(fab @click="set_dl=true" x-small dark)-->
    <!--          v-icon mdi-camera-->
    div(v-if="show_overlay")
      .buttongroup.shift_anim(:style="button_group_shift")
        v-btn(v-if="show_layer_menu_button" dark color="green" fab @click="open_layer_dialog")
          v-icon mdi-layers-outline
        v-btn(v-if="show_style_menu_button" dark color="orange" fab @click="open_style_dialog")
          v-icon mdi-earth-box
        v-btn(v-if="show_location_search_button" dark color="yellow" fab @click="show_location_search_field=!show_location_search_field")
          v-icon mdi-magnify
        v-text-field.mt-1(solo hide-details v-if="show_location_search_field" v-model="search_location_text" @keyup.enter="search_location")
        v-select.mt-1(v-if="show_search_results" autofocus solo hide-details return-object :items="search_options" item-text="place_name" item-value="id" @input="goto_result($event)")
        v-sheet.ml-3(color="grey" v-if="is_dev")
          span.pl-1 {{act_zoom}}
      .central_button(v-if="show_center_create_button")
        v-container.shift_anim(:style="center_button_shift")
          CreateEntryButton(:domain_data="domain_data" @create_entry="$emit('create_entry', $event)")
      .overlay_menu(v-if="show_legend")
        TemplateLegend(:domain_data="domain_data" ref="legendComponent")
    AspectDialog(v-bind="aspectdialog_data" @update:dialog_open="aspectdialog_data.dialog_open = $event" :ext_value="packed_layer_status" @update:ext_value="aspect_dialog_update($event)")
    client-only
      Mapbox(
        v-if="!map_hidden"
        :style="map_height"
        :access-token="access_token"
        :map-options="last_map_options"
        @click="click"
        @render="render"
        @map-load="onMapLoaded")
      v-overlay(opacity="0.4" v-if="show_load_overlay")
        v-progress-circular(indeterminate size="64")
</template>

<script>

import Mapbox from 'mapbox-gl-vue'
import MapIncludeMixin from "~/components/map/MapIncludeMixin"
import {review_color, draft_color, cluster_color, VIEW, MENU_MODE_DOMAIN, TEMPLATE} from "~/lib/consts"
import {mapGetters} from "vuex"
import DomainMapMixin from "~/components/map/DomainMapMixin"
import HasMainNavComponentMixin from "~/components/global/HasMainNavComponentMixin"
import TemplateLegend from "~/components/menu/TemplateLegend"
import AspectDialog from "~/components/dialogs/AspectDialog"
import {LAYER_BASE_ID} from "~/lib/map_utils"
import {common_place_name, entry_location2geojson_arr, get_all_countries} from "~/lib/location"
import {create_cluster_select_search_config} from "~/lib/codes"
import FilterMixin from "~/components/FilterMixin"
import EntryFetchMixin from "~/components/entry/EntryFetchMixin"
import MapEntriesMixin from "~/components/map/MapEntriesMixin"
import CreateEntryButton from "~/components/CreateEntryButton";
import ResponsivenessMixin from "~/components/ResponsivenessMixin";
import EnvMixin from "~/components/global/EnvMixin"
import {pack_value, unpack} from "~/lib/aspect";
import {
  BUS_ADD_LAYER_TO_MAP,
  BUS_ADD_SOURCE_TO_MAP,
  BUS_MAP_LOADED,
  BUS_MAP_MARKER_HIDE,
  BUS_MAP_MARKER_SHOW,
  BUS_TRIGGER_SEARCH,
  BUS_REMOVE_LAYER_FROM_MAP,
  BUS_REMOVE_SOURCE_FROM_MAP,
  BUS_MAP_FLY_TO,
  BUS_MAP_FIT_BOUNDS,
  BUS_MAP_GOTO_GEOMETRY_FEATURE_VALUE
} from "~/plugins/bus";
import {recursive_unpack, recursive_unpack2} from "~/lib/util";

const cluster_layer_name = LAYER_BASE_ID + '_clusters'
const show_cluster_place_name = false

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

const MAIN_SOURCE_LAYER = "all_entries_source"

export default {
  name: "MapWrapper",
  components: {CreateEntryButton, AspectDialog, TemplateLegend, Mapbox},
  mixins: [MapIncludeMixin, DomainMapMixin, HasMainNavComponentMixin, FilterMixin, EntryFetchMixin,
    MapEntriesMixin, ResponsivenessMixin, EnvMixin],
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
      set_dl: false,
      aspectdialog_data: {
        aspect: {
          name: "visible layers",
          label: this.$t("comp.map_wrapper.layer_asp.label"),
          type: "multiselect",
          attr: {
            force_view: "list"
          },
          items: null, // gets updated when opened
        },
        fix_width: 400,
        ext_value: {value: null},
        dialog_open: false
      },
      map_goto_action: null, // only for storing locations before the map is loaded...
      act_cluster: null,
      act_cluster_expansion_zoom: null,
      act_zoom: null,
      last_zoom: null,
      initialized: false,
      layers_created: false,
      actual_markers: [],
      last_map_options: {}, // this is for small screen, which dont seem to recall a computed prop when showing the map again
      added_entry_source_layer_ids: [],
      added_entry_layer_ids: [],
      show_location_search_field: false,
      show_search_results: false,
      search_options: [],
      search_location_text: "",
    }
  },
  computed: {
    ...mapGetters({
      layer_status: "map/layer_status",
    }),
    map_hidden() {
      if (this.is_dev && this.$_.get(this.$nuxt.context.env, "DEV_CONFIG.HIDE_MAP", false)) {
        return true
      }
      if (this.is_small) {
        return this.menu_open
      }
    },
    packed_layer_status() {
      return pack_value(this.layer_status)
    },
    selected_entry() {
      // console.log("comp.selected_entry")
      return this.query_entry_uuid
    },
    button_group_shift() {
      let shift = "0.5%"
      if (this.menu_open) {
        shift = this.menu_width + "px"
      }
      return {
        "left": shift
      }
    },
    center_button_shift() {
      let shift = "0"
      if (this.menu_open) {
        shift = this.menu_width / 2 + "px"
      }
      return {
        position: "absolute",
        left: shift
      }
    },
    center_padding() {
      // todo when there will be stuff coming from the bottom
      if (!this.menu_open) {
        return {}
      } else {
        return {
          left: this.$store.getters["menu/menu_width"]
        }
      }
    },
    // todo maybe move to domainMapMixin
    entries() {
      return this.all_map_entries(this.domain_name)
    },
    show_legend() {
      if (!this.$_.isEmpty(this.domain_templates_color_list) && this.can_create_multiple_etypes) {
        return ((this.is_md && !this.menu_open) || this.is_large)
      }
    },
    map_height() {
      return {
        height: (this.height ? this.height : window.innerHeight) + (typeof (this.height) === "number" ? "px" : "")
      }
    },
    show_layer_menu_button() {
      return this.map_loaded && this.available_layers.length > 0
    },
    show_location_search_button() {
      return false // todo add back later, when using the auto-complete: this.map_loaded
    },
    show_style_menu_button() {
      return false
    },
    show_load_overlay() {
      if (this.map_hidden) {
        return false
      }
      // the upadting flag doesnt work properly since mapbox does it async
      // console.log("e loaded", this.entries_loaded, this.map_loaded, this.initialized)
      return !this.entries_loaded || !this.map_loaded || !this.initialized
    },
    show_overlay() {
      return !this.menu_open || this.is_mdAndUp
    },
    show_center_create_button() {
      return this.is_mdAndUp
    }
  },
  created() {
    // console.log("map created...")
    if (this.domain_name) {
      this.load_map_entries(this.domain_name)
    } else {
      console.log("no domain for map-wrapper")
    }
    this.last_map_options = this.map_options()

    this.$bus.$on(BUS_MAP_MARKER_SHOW, ({uuid}) => {
      // console.log("bus-show")
      this.change_entry_markers_mode(uuid, true)
    })
    this.$bus.$on(BUS_MAP_MARKER_HIDE, ({uuid}) => {
      // console.log("bus-hide", this.selected_entry)
      // when entry is selected dont trigger this
      if (!this.selected_entry) {
        this.change_entry_markers_mode(uuid, false)
      }
    })
    this.$bus.$on(BUS_TRIGGER_SEARCH, () => {
      this.load_map_entries(this.domain_name)
    })

    this.$bus.$on(BUS_ADD_SOURCE_TO_MAP, (layer_id, data) => {
      // console.log("BUS_ADD_SOURCE_TO_MAP", layer_id, data)
      this.map.addSource(layer_id, {type: "geojson", data: data})
      this.added_entry_source_layer_ids.push(layer_id)
    })

    this.$bus.$on(BUS_ADD_LAYER_TO_MAP, (layer_data) => {
      // console.log("BUS_ADD_LAYER_TO_MAP", layer_data)
      this.map.addLayer(layer_data)
      this.added_entry_layer_ids.push(layer_data.id)
    })

    this.$bus.$on(BUS_REMOVE_SOURCE_FROM_MAP, (layer_id) => {
        this.map.removeSource(layer_id)
      }
    )

    this.$bus.$on(BUS_REMOVE_LAYER_FROM_MAP, (layer_id) => {
        this.removeLayer(layer_id)
      }
    )

    // TODO : unite the following functions...
    this.$bus.$on(BUS_MAP_GOTO_GEOMETRY_FEATURE_VALUE, value => {
      // console.log("map received goto-geometry-feature-value", value)
      // this.map_goto_geometry_feature_value(value)
      this.map_goto_action = [BUS_MAP_GOTO_GEOMETRY_FEATURE_VALUE, value]
    })

    this.$bus.$on(BUS_MAP_FLY_TO, coordinates => {
      // this.map_goto_location(coordinates)
      this.map_goto_action = [BUS_MAP_FLY_TO, coordinates]
    })

    this.$bus.$on(BUS_MAP_FIT_BOUNDS, bbox => {
      // this.map_fitBounds(bbox)
      this.map_goto_action = [BUS_MAP_FIT_BOUNDS, bbox]
    })
    //console.log("map created with goto action", this.map_goto_action)
  },
  methods: {
    map_options() {
      let options = this.$_.cloneDeep(this.default_map_options)
      const cached_options = this.$store.getters["map/cached_camera_options"](this.domain_name)
      if (cached_options) {
        Object.assign(options, cached_options)
      } else {
        // only consider default options, when nothing cached
        // otherwise, center,zoom & bounds option would be present and mapbox takes bounds
        const domain_init_map_options =
          this.$_.get(this.$store.getters["domain/lang_domain_data"](this.domain_name, this.$store.getters.ui_language),
            "map.init_map_options")
        if (domain_init_map_options) {
          Object.assign(options, domain_init_map_options)
        }
      }
      return options
    },
    check_entries_map_done() {
      if (this.entries_loaded && this.entries.features && this.map_loaded && this.get_all_uuids) {

        this.init_map_source_and_layers()
        this.initialized = true
        if (this.$route.query.uuid) {
          this.update_navigation_mode(this.$route.query.uuid, VIEW)
          this.change_entry_markers_mode(this.$route.query.uuid, true)
        }
      }
    },
    init_map_source_and_layers(layer_base_id = "all_entries") {
      // console.log("init_map_source_and_layers", this.entries.features.length)
      const source_name = layer_base_id + "_source"
      this.update_filtered_source()

      if (this.layers_created) {
        // console.log("layers_created", this.layers_created)
        return
      }
      // entries layer
      const entries_layer_name = layer_base_id + '_entries' // all_entries_entries
      // console.log("l",this.map.getLayer(entries_layer_name))
      if (!this.$_.isEmpty(this.domain_templates_color_list)) {
        this.add_entry_layer(source_name, entries_layer_name, {
          'circle-color': ["case",["has","marker-clr"], ["get","marker-clr"],[
            'match',
            ['get', "template"],
            ...this.domain_templates_color_list,
            '#ccc']],
          "circle-opacity": 0.8,
          "circle-radius": [
            'case',
            ["boolean", ['feature-state', 'hover'], false], //["any", ["boolean", ['feature-state', 'hover'], false], ["boolean", ['feature-state', 'selected'], false]],
            9,
            this.is_small ? 9 : 7 // tried ["interpolate", ["linear"], ["zoom"], 1, 10, 13, 20]
          ],
          "circle-stroke-color": [
            "match",
            ["get", "status"],
            "draft",
            draft_color,
            "requires_review",
            review_color,
            cluster_color
          ],
          "circle-stroke-width": [
            "case",
            ["any", ["boolean", ["feature-state", "selected"], false], ["==", ["get", "status"], "draft"], ["==", ["get", "status"], "requires_review"]],
            2,
            0
          ]
        })
      } else {
        console.log("no template color list. skipping entry layer and legend")
      }
      // Interactions
      this.add_default_entries_layer_interactions(source_name, entries_layer_name, (features) => {
        this.select_entry_marker(features[0])
      })

      // cluster layer
      const cluster_layer_name = layer_base_id + '_clusters'
      const cluster_layer = this.map.getLayer(cluster_layer_name)
      // console.log("cluster_layer?", Object.keys(this.map.style._layers).includes(cluster_layer))

      if (!cluster_layer) {
        // console.log("adding cluster layer")
        this.add_cluster_layer(source_name, cluster_layer_name, {
          'circle-color': '#f1f075',
          'circle-radius': [
            'interpolate',
            ["linear"],
            ['get', 'point_count'],
            2,
            10,
            20,
            15
          ]
        })

        this.map.on('mouseenter', cluster_layer_name, e => {
          const cluster = e.features[0]
          // console.log(cluster)
          if (cluster.id === this.act_hoover_id) {
            return
          }
          // if (cluster.state.selectable) {
          this.act_hoover_id = cluster.id
          this.act_cluster = cluster

          const source = this.map.getSource(MAIN_SOURCE_LAYER)
          source.getClusterExpansionZoom(cluster.id, (err, zoom) => {
            // console.log("zoom", zoom)
            this.act_cluster_expansion_zoom = zoom
          })

          clusterLeaves(source, cluster.id, cluster.properties.point_count).then(features => {
            // console.log(features)
            // todo temp solution
            let popup_html
            // features.map
            const entry_counts = this.$_.reduce(features, (ec, f) => {
              if (ec[f.properties.title]) {
                ec[f.properties.title][1] += 1
              } else {
                ec[f.properties.title] = [f.properties.title, 1]
              }
              return ec
            }, {})
            if (this.$_.size(entry_counts) <= 5) {
              popup_html = this.$_.map(entry_counts, f => {
                let text = `<div> &#183; ${f[0]}`
                if (f[1] > 1) {
                  text += `,  ${this.$tc("comp.map_wrapper.locations", f[1])}`
                }
                text += "</div>"
                return text
              }).join("")
            } else {
              popup_html = `${this.$_.size(entry_counts)} entries`
            }
            this.add_popup(cluster, e, popup_html)
            this.last_zoom = this.map.getZoom()
          }).catch(err => {
            console.log(err)
          })
        })

        this.map.on('mouseleave', cluster_layer_name, () => {
          if (this.act_hoover_id) {
            this.act_hoover_id = null
            this.remove_all_popups()
            this.act_cluster = null
            this.last_zoom = null
          }
        })

        // CLICK ON CLUSTER
        this.map.on('click', cluster_layer_name, e => {
          // console.log(cluster)
          const cluster = e.features[0]
          this.update_menu_state(MENU_MODE_DOMAIN)
          this.map_goto_location(cluster.geometry)
          // this is used for real clusters, which expand, cuz the locations are not "exactly the same"

          // this.map.getSource(MAIN_SOURCE_LAYER).getClusterExpansionZoom(cluster.id, (err, zoom) => {
          //   this.map.easeTo({
          //     center: cluster.geometry.coordinates,
          //     zoom: Math.min(zoom, 10)
          //   })
          // })

          // todo, maybe there is a easier way to get the common_place_name
          const source = this.map.getSource(MAIN_SOURCE_LAYER)
          clusterLeaves(source, cluster.id, cluster.properties.point_count).then(features => {
            let location_text = cluster.state.common_place
            if (!location_text) {
              const countries = get_all_countries(features)
              if (countries.size > 3) {
                location_text = this.$t("comp.map_wrapper.several_countries")
              } else {
                location_text = Array.from(get_all_countries(features).values()).join(", ")
              }
            }
            const place_name = location_text
            const uuids = Array.from(new Set(features.map(f => f.properties.uuid).values()))
            this.$store.commit("search/replace_in_act_config", create_cluster_select_search_config(place_name, uuids))
            this.update_navigation_mode(null, false, false, this.is_mdAndUp)
          })
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

        if (show_cluster_place_name) {
          // 3rd a source layer for region names
          // dynamically updated
          const cluster_region_names_source = "cluster_region_names_source"
          this.map.addSource(cluster_region_names_source, {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: []
            }
          })

          // 4th, region name layer
          this.map.addLayer({
            id: 'cluster-region-label',
            type: 'symbol',
            source: cluster_region_names_source,
            layout: {
              "text-allow-overlap": true,
              // "text-ignore-placement": true,
              "text-justify": "auto",
              'text-variable-anchor': ['top', 'bottom'],
              "text-field": ["get", "region_name"],
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              "text-offset": [0, 0.7],
              'text-size': 14,
            },
            paint: {
              "text-halo-color": "#fde7a4",
              "text-halo-width": 1
            }
          })
        }
        this.debounced_cluster_status = this.$_.debounce(this.check_cluster_states, 30)
      } else {
        console.log("cluster layer exists already")
      }
      this.layers_created = true
    },
    update_filtered_source() {
      // console.log("update_filtered_source", this.selected_entry)
      // this.updating = true
      if (!this.entries_loaded || !this.map_loaded || !this.get_all_uuids) {
        return
      }
      const filtered_entries = {
        type: "FeatureCollection",
        features: this.entries.features.filter(e => this.get_all_uuids.includes(e.properties.uuid) ||
          (e.properties.uuid === this.selected_entry))
        // features: this.entries.features.filter(e => included_templates.includes(e.properties.template) ||
        //   (e.properties.uuid === this.selected_entry))
      }

      if (process.env.NODE_ENV !== "development") {
        for (let uuid in this.get_all_uuids) {
          if (!this.$_.find(this.entries.features, f => f.properties.uuid)) {
            console.log("uuid without map-entry")
          }
        }
      }

      const include_types = recursive_unpack(this.$store.getters["search/get_act_config_value_by_name"](TEMPLATE))
      const drafts = this.$_.flatten(this.$store.getters["entries/domain_drafts"](this.domain_name)
        .filter(e => include_types.includes(e.template.slug)).map(e =>
          entry_location2geojson_arr(e, ["status"], `[${this.$t("comp.entry.no_title")}]`)))
      for (let i in drafts) {
        drafts[i].id = filtered_entries.features.length + parseInt(i)
      }
      filtered_entries.features = filtered_entries.features.concat(drafts)
      // console.log(this.map.style.stylesheet.layers)
      // for (let layer of this.map.style.stylesheet.layers) {
      //   if(layer.metadata) {
      //     console.log(layer.id, layer.metadata["mapbox:group"])
      //   } else {
      //     console.log(layer.id, layer.metadata)
      //   }
      // }
      if (!this.map.getSource(MAIN_SOURCE_LAYER)) {
        this.map.addSource(MAIN_SOURCE_LAYER, {
          type: "geojson",
          data: filtered_entries,
          cluster: true,
          tolerance: 0,
          // generateId: true, // this fucks up selection state of features, since the ids change or something...
          clusterMaxZoom: 22,
          clusterRadius: 0.5,
          generateId: true
        })
      } else {
        this.map.getSource(MAIN_SOURCE_LAYER).setData(filtered_entries)
      }
      // this.updating = false
      if (this.selected_entry) {
        this.change_entry_markers_mode(this.selected_entry, true)
      }

    },
    aspect_dialog_update(selected_layers) {
      // todo could be fixed by making multiselects default: []
      this.set_layer_visibility(unpack(selected_layers))
    },
    change_entry_markers_mode(entry_uuid, selected) {
      if (!this.initialized) {
        return
      }
      // console.log("MapWrapper.change_entry_markers_mode", entry_uuid, selected)
      try {
        const features = this.map.getSource(MAIN_SOURCE_LAYER)._data.features
        // console.log("all features", features)
        const relevant_features = this.$_.filter(features, (f) => f.properties.uuid === entry_uuid)
        // console.log(relevant_features, selected)
        // console.log(relevant_features)
        // console.log(this.actual_marker)
        for (let marker of this.actual_markers) {
          marker.remove()
        }
        this.actual_markers = []

        if (selected) {
          for (let feature of relevant_features) {
            const marker = new this.mapboxgl.Marker()
            this.actual_markers.push(marker)
            marker.setLngLat(feature.geometry.coordinates).addTo(this.map)
          }
        }
      } catch (err) {
        // mapbox cries on... but it works anyway...
        // const features = this.map.getSource(MAIN_SOURCE_LAYER)._data.features
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
      const source = this.map.getSource(MAIN_SOURCE_LAYER)
      const region_source_features = []

      for (let cluster of clusters) {
        const cluster_id = cluster.id
        // console.log(cluster)
        const leaves = await clusterLeaves(source, cluster_id, cluster.properties.point_count)

        let common_place = null
        if (cluster.state.hasOwnProperty("common_place"))
          common_place = cluster.state.common_place
        else
          common_place = common_place_name(leaves)

        this.map.setFeatureState(
          {source: MAIN_SOURCE_LAYER, id: cluster_id},
          {common_place: common_place}
        )

        if (common_place) {
          region_source_features.push({
            type: "Feature",
            geometry: cluster.geometry,
            properties: {region_name: common_place, orig_cluster_id: cluster_id}
          })
        }
      }

      if (show_cluster_place_name) {
        this.map.getSource("cluster_region_names_source").setData({
          "type": "FeatureCollection",
          "features": region_source_features
        })
      }

    },
    check_hide_map() {

    },
    click(map, event) {
      // check since on small screens legend might not be there
      if (this.$refs.legendComponent)
        this.$refs.legendComponent.force_close()

      // console.log(event.lngLat)
      // const elevation = map.queryTerrainElevation([event.lngLat.lng, event.lngLat.lat], {exaggerated: false});
      // console.log(map.queryTerrainElevation)
      // console.log(elevation)

      // const features = this.map.getSource(MAIN_SOURCE_LAYER)._data.features
      // // console.log(features)
      // for (let f of features) {
      //   // console.log(this.$_.isEqual(Object.keys(f), ["type","id", "geometry", "properties"]))
      //   // console.log(Object.keys(f) === )
      //   const state = this.map.getFeatureState({source: MAIN_SOURCE_LAYER, id: f.id})
      //   if(!this.$_.isEmpty(state)) {
      //     console.log(f.id, state)
      //   }
      // }

      // this grabs the GRIDCODE from the climate type tile layer
      // for a feature: when the climate type layer is active, a click should show a small snackbar that tells the climate type
      // needs quite a bunch of new description stuff in domain.json and the GRIDCODE value -> text code entry
      // this.$axios.get(`https://api.mapbox.com/v4/ramin36.b8rxe0dj/tilequery/${event.lngLat.lng},${event.lngLat.lat}.json?radius=25&limit=5&dedupe&access_token=${this.access_token}`).then(res => {
      //   console.log(res.data.features[0].properties.GRIDCODE)
      // })
    },
    download(map) {
      this.set_dl = false
      // console.log(re)
      let image = map.getCanvas().toDataURL("image/png")
        .replace("image/png", "image/octet-stream")
      let a = document.createElement('a')
      a.href = image
      a.download = "neat.png"
      a.click()
    },
    open_layer_dialog() {
      this.aspectdialog_data.aspect.items = this.available_layers
      this.aspectdialog_data.dialog_open = true
    },
    search_location() {
      this.geocode(this.search_location_text).then(data => {
        if (data.features.length > 0) {
          this.show_search_results = true
          this.search_options = data.features
        } else {
          this.search_options = []
        }
      }).catch(err => {
        console.log(err)
      })
    },
    goto_result(selected_place) {
      if (selected_place) {
        console.log(selected_place)
        this.map_fitBounds(selected_place.bbox)
      }
      this.search_location_text = ""
      this.show_search_results = false
      this.show_location_search_field = false
    },
    open_style_dialog() {

    },
    store_cam_options() {
      // console.log("storing cam map options")
      if (this.map) {
        this.$store.commit("map/set_camera_options_cache", {
          domain: this.domain_name, options: {
            zoom: this.map.getZoom(),
            center: this.map.getCenter()
          }
        })
      }
    },
    render(map) {
      this.act_zoom = map.getZoom()
      if (this.set_dl)
        download(map)
      if (this.entries_loaded && map.getLayer(cluster_layer_name)) {
        this.cluster_label_layer_visible = true
        const clusters = map.queryRenderedFeatures(undefined, {layers: [cluster_layer_name]})
        // not defined right from the begining
        if (this.debounced_cluster_status) {
          this.debounced_cluster_status(clusters)
        }
      } else {
        this.cluster_label_layer_visible = false
      }
      if (this.act_cluster) {
        const zoom = this.map.getZoom()
        if (zoom > this.act_cluster_expansion_zoom || zoom < this.last_zoom) {
          this.act_hoover_id = null
          this.act_cluster = null
          // ?!?!?
          this.remove_all_popups()
        } else {
          this.last_zoom = zoom
        }
      }
    },
    select_entry_marker(feature) {
      // console.log("select_entry_marker", feature)
      const entry_uuid = feature.properties.uuid
      this.guarantee_entry(entry_uuid).then(() => {
        if (!this.is_small) {
          this.map_goto_location(feature.geometry)
        }
        this.update_navigation_mode(entry_uuid, VIEW, false)
      }, (err) => {
        this.err_error_snackbar(err)
      })
    },
    trigger_dl() {
      this.set_dl = true
      this.map.triggerRepaint()
    },
    remove_entry_layers() {
      for (let layer_id of this.added_entry_layer_ids) {
        if (!this.map.getLayer(layer_id)) {
          console.warn("Layer not found", layer_id)
        } else {
          this.map.removeLayer(layer_id)
        }
      }
      for (let src_layer_id of this.added_entry_source_layer_ids) {
        if (!this.map.getSource(src_layer_id)) {
          console.warn("Source layer not found", src_layer_id)
        } else {
          this.map.removeSource(src_layer_id)
        }
      }
      this.added_entry_source_layer_ids = []
      this.added_entry_source_layer_ids = []
    }
  },
  beforeDestroy() {
    // todo consider padding from menu
    if (this.map) {
      this.$store.commit("map/map_loaded", false)
    }
    this.store_cam_options()
    for (const event_name of [
      BUS_MAP_MARKER_SHOW, BUS_MAP_MARKER_HIDE, BUS_TRIGGER_SEARCH, BUS_ADD_SOURCE_TO_MAP,
      BUS_ADD_LAYER_TO_MAP, BUS_REMOVE_SOURCE_FROM_MAP, BUS_REMOVE_LAYER_FROM_MAP, BUS_MAP_FLY_TO, BUS_MAP_FIT_BOUNDS,
      BUS_MAP_GOTO_GEOMETRY_FEATURE_VALUE
    ]) {
      this.$bus.$off(event_name)
    }
    this.remove_entry_layers()
  },
  watch: {
    map_hidden(hidden) {
      if (hidden) {
        this.map_loaded = false
        this.layers_created = false
        this.store_cam_options()
      } else {
        this.last_map_options = this.map_options()
      }
    },
    entries_loaded(loaded) {
      // console.log("entries loaded", loaded)
      if (loaded)
        this.check_entries_map_done()
    },
    map_loaded() {
      this.check_entries_map_done()
      this.$store.commit("map/map_loaded", true)
      this.$bus.$emit(BUS_MAP_LOADED)
      if (this.map_goto_action) {
        const value = this.map_goto_action[1]
        switch (this.map_goto_action[0]) {
          case BUS_MAP_GOTO_GEOMETRY_FEATURE_VALUE:
            this.map_goto_geometry_feature_value(value)
            break
          case BUS_MAP_FLY_TO:
            this.map_goto_location(value)
            break
          case BUS_MAP_FIT_BOUNDS:
            this.map_fitBounds(value)
            break
        }
      }
    },
    menu_open() {
      this.check_hide_map()
    },
    get_all_uuids() {
      this.update_filtered_source()
      if (!this.initialized) {
        this.check_entries_map_done()
      }
    },
    goto_location(location) {
      console.log("watch goto_locatio", location)
      if (location) {
        this.map_goto_location(location)
      }
    },
    menu_state() {
      this.check_hide_map()
    },
    selected_entry(uuid, old_uuid) {
      // console.log("selected_entry", uuid, old_uuid)
      // console.log("MapWrapper.watch.selected_entry", uuid, old_uuid)
      if (old_uuid) {
        this.change_entry_markers_mode(old_uuid, false)
        this.remove_entry_layers()
      }
      if (uuid) {
        this.change_entry_markers_mode(uuid, true)
        this.$emit("force_menu_mode_domain")
      }
    },
  }
}
</script>

<style scoped>

.fullSize {
  position: absolute;
  width: 100%;
  height: 100%;
}

.buttongroup {
  position: absolute;
  top: 2%;
  height: 5%;
  z-index: 2;
}

.central_button {
  position: absolute;
  top: 2%;
  z-index: 1;
  left: 45%;
}

.overlay_menu {
  position: absolute;
  top: 2%;
  z-index: 1;
  right: 5%;
}

.shift_anim {
  transition: left 0.2s;
  transition-timing-function: ease-out;
}

</style>
