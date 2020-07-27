<template lang="pug">
  .fullsize
    <!--      .buttons-->
    <!--        v-btn(fab @click="set_dl=true" x-small dark)-->
    <!--          v-icon mdi-camera-->
    div(v-if="show_overlay")
      .buttongroup.shift_anim(:style="button_group_shift")
        v-btn(v-if="show_menu_button" dark fab large color="blue" @click="switch_menu_open")
          v-icon mdi-menu
        v-btn(dark color="green" fab @click="open_layer_dialog")
          v-icon mdi-layers-outline
      .central_button
        v-container.shift_anim(:style="center_button_shift")
          v-btn(
            :style="{transform: 'translateX(-50%)'}"
            v-bind="bp_based_main_create_btn_props"
            color="success"  @click="create_from_main_template")
            span(v-if="show_main_template_create_text") {{main_template.create_text}}
            v-icon mdi-plus
          v-btn.additional_templates_button(dark x-small absolute bottom fab v-if="can_create_multiple_etypes"
            :style="additional_template_button_shift"
            @click="$emit('create_entry')")
            v-icon mdi-dots-horizontal
      .overlay_menu(:style="legend_style")
        TemplateLegend(:domain_name="domain" ref="legendComponent")
    .buttongroup.shift_anim(v-else-if="menu_state === 0" :style="button_group_shift")
      v-btn(v-if="show_menu_button" dark fab large color="blue" @click="switch_menu_open")
        v-icon mdi-menu
    AspectDialog(v-bind="aspectdialog_data" @update:dialog_open="aspectdialog_data.dialog_open = $event" :ext_value="layer_status" @update:ext_value="aspect_dialog_update($event)")
    client-only
      mapbox.fullSize(
        v-show="!map_hidden"
        :style="map_height"
        :access-token="access_token"
        :map-options="map_options"
        @click="click"
        @render="render"
        @map-load="onMapLoaded")
</template>

<script>

  import Mapbox from 'mapbox-gl-vue'
  import MapIncludeMixin from "~/components/map/MapIncludeMixin"
  import {MENU_MODE_DOMAIN_OVERVIEW, VIEW} from "~/lib/consts"
  import {mapGetters} from "vuex"
  import DomainMapMixin from "~/components/map/DomainMapMixin"
  import {ENTRIES_HAS_FULL_ENTRY, ENTRIES_SAVE_ENTRY} from "~/store/entries"
  import HasMainNavComponentMixin from "~/components/global/HasMainNavComponentMixin"
  import {MAP_GOTO_LOCATION} from "~/store/map"
  import TemplateLegend from "~/components/menu/TemplateLegend"
  import AspectDialog from "~/components/aspect_utils/AspectDialog"
  import {transform_options_list} from "~/lib/options"
  import {LAYER_BASE_ID} from "~/lib/map_utils"
  import EntryCreateList from "~/components/EntryCreateList"
  import {common_place_name, get_all_countries} from "~/lib/location"
  import {create_cluster_select_search_config} from "~/lib/codes"

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
    name: "MapWrapper",
    mixins: [MapIncludeMixin, DomainMapMixin, HasMainNavComponentMixin],
    components: {EntryCreateList, AspectDialog, TemplateLegend, Mapbox},
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
        aspectdialog_data: null,
        act_cluster: null,
        act_cluster_expansion_zoom: null,
        last_zoom: null,
        map_hidden: false
      }
    },
    computed: {
      ...mapGetters({
        entries_loaded: "map/entries_loaded",
        all_map_entries: "map/entries",
        legend_selection: "map/get_filter_config",
        layer_status: "map/layer_status",
        all_uuids: "search/get_all_uuids",
      }),
      get_all_uuids() {
        return this.all_uuids()
      },
      layer_aspectdialog_data() {
        return {
          aspect: {
            name: "Visible layers",
            type: "multiselect",
            attr: {
              unpacked: true,
              force_view: "list"
            },
            items: this.available_layers
          },
          fix_width: 400,
          ext_value: {value: null},
          dialog_open: true
        }
      },
      show_menu_button() {
        return this.$vuetify.breakpoint.mdAndUp
      },
      show_overlay() {
        return !this.menu_open || this.$vuetify.breakpoint.mdAndUp
      },
      legend_style() {
        if (this.$vuetify.breakpoint.smAndDown) {
          return {
            visibility: "hidden"
          }
        }
      },
      show_main_template_create_text() {
        return (!this.menu_open || this.$vuetify.breakpoint.lgAndUp) && !this.$vuetify.breakpoint.smAndDown
      },
      bp_based_main_create_btn_props() {
        if (this.show_main_template_create_text) {
          return {"rounded": true, "large": true}
        } else {
          return {"fab": true}
        }
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
        // console.log(this.$vuetify.breakpoint.name)
        let shift = "0"
        if (this.menu_open) {
          shift = this.menu_width / 2 + "px"
        }
        return {
          position: "absolute",
          left: shift
        }
      },
      additional_template_button_shift() {
        // todo 110 is very magic, depends on the length of the main create button text
        let shift = "110px"
        if (!this.show_main_template_create_text) {
          shift = "40px"
        }
        // console.log("shift", shift)
        return {
          position: "absolute",
          left: shift
        }
      },
      entries() {
        return this.all_map_entries(this.domain)
      },
      map_height() {
        return {
          height: (this.height ? this.height : window.innerHeight) + (typeof (this.height) === "number" ? "px" : "")
        }
      },
      domain_templates_color_list() {
        return this.templates_color_list(this.$store.getters["templates/templates_of_domain"](this.domain))
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
        // todo when there will be stuff coming from the bottom
        if (!this.menu_open) {
          return {}
        } else {
          return {
            left: this.$store.getters["menu/menu_width"]
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
      click(e, m) {
        // check since on small screens legend might not be there
        if (this.$refs.legendComponent)
          this.$refs.legendComponent.force_close()
      },
      open_layer_dialog() {
        // to much computation?
        this.aspectdialog_data = this.layer_aspectdialog_data
        this.aspectdialog_data.dialog_open = true
      },
      trigger_dl() {
        this.set_dl = true
        this.map.triggerRepaint()
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
      render(map) {
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
      check_entries_map_done() {
        // console.log("check_entries_map_done", this.entries)
        if (this.entries_loaded && this.entries.features.length > 0 && this.map_loaded && this.get_all_uuids) {
          this.init_map_source_and_layers()
          this.initialized = true
          if (this.$route.query.uuid) {
            this.update_navigation_mode(this.$route.query.uuid, VIEW)
            this.change_entry_markers_mode(this.$route.query.uuid, true)
          }
        }
      },
      init_map_source_and_layers(layer_base_id = "all_entries") {
        // console.log(this.entries.features.length)
        const source_name = layer_base_id + "_source"
        this.update_filtered_source()

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

            const source = this.map.getSource("all_entries_source")
            source.getClusterExpansionZoom(cluster.id, (err, zoom) => {
              // console.log("zoom", zoom)
              this.act_cluster_expansion_zoom = zoom
            })

            clusterLeaves(source, cluster.id, cluster.properties.point_count).then(features => {
              // console.log(features)
              // todo temp solution
              let popup_html = ""
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
                popup_html = this.$_.map(entry_counts, f => "<div> &#183; " + f[0] + ", " + this.$tc("comp.map_wrapper.locations", f[1]) + "</div>").join("")
              } else {
                popup_html = `${this.$_.size(entry_counts)} entries`
              }
              this.add_popup(cluster, e, popup_html)
              this.last_zoom = this.map.getZoom()
            }).catch(err => {
              console.log(err)
            })
          })

          this.map.on('mouseleave', cluster_layer_name, (e) => {
            if (this.act_hoover_id) {
              this.act_hoover_id = null
              this.remove_all_popups()
              this.act_cluster = null
              this.last_zoom = null
            }
          })

          this.map.on('click', cluster_layer_name, e => {
            // console.log(cluster)
            const cluster = e.features[0]

            // todo, maybe there is a easier way to get the common_place_name
            const source = this.map.getSource("all_entries_source")
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
            })
            // }
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

          this.debounced_cluster_status = this.$_.debounce(this.check_cluster_states, 30)

        } else {
          console.log("cluster layer exists already")
        }

        // entries layer
        const entries_layer_name = layer_base_id + '_entries'
        this.add_entry_layer(source_name, entries_layer_name, {
          'circle-color': [
            'match',
            ['get', "template"],
            ...this.domain_templates_color_list,
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
        })

        // Interactions
        this.add_default_entries_layer_interactions(source_name, entries_layer_name, (features) => {
          this.select_entry_marker(features[0])
        })
      },
      async check_cluster_states(clusters) {
        const cluster_ids = clusters.map(c => c.id)

        // console.log(cluster_ids)
        if (this.$_.isEqual(this.last_features_updated, cluster_ids)) {
          return
        }
        this.last_features_updated = cluster_ids
        // console.log("debounced m", cluster_ids)
        const source_layer_name = "all_entries_source"
        const source = this.map.getSource(source_layer_name)
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
            {source: 'all_entries_source', id: cluster_id},
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
        this.map.getSource("cluster_region_names_source").setData({
          "type": "FeatureCollection",
          "features": region_source_features
        })
      },
      update_filtered_source() {
        if (!this.entries_loaded || !this.map_loaded || !this.get_all_uuids) {
          return
        }
        // console.log("update_filtered_source")
        // console.log(this.map.getSource("all_entries_source"))
        // const included_templates = this.legend_selection.map(s => s.value)

        const filtered_entries = {
          type: "FeatureCollection",
          features: this.entries.features.filter(e => this.get_all_uuids.includes(e.properties.uuid) ||
            (e.properties.uuid === this.selected_entry))
          // features: this.entries.features.filter(e => included_templates.includes(e.properties.template) ||
          //   (e.properties.uuid === this.selected_entry))
        }
        if (!this.map.getSource("all_entries_source")) {
          this.map.addSource("all_entries_source", {
            type: "geojson",
            data: filtered_entries,
            cluster: true,
            tolerance: 0,
            clusterMaxZoom: 14,
            clusterRadius: 25
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
          this.map_goto_location(feature.geometry)
        } else {
          // console.log("fetching entry")
          this.$api.entry__$uuid(entry_uuid).then(({data}) => {
            // this.$store.commit("map/goto_location",)
            if (data.data) {
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
        // console.log("MapWrapper.change_entry_markers_mode", selected)
        const features = this.map.getSource("all_entries_source")._data.features
        // console.log("all features", features)
        const relevant_features = this.$_.filter(features, (f) => f.properties.uuid === entry_uuid)
        // console.log(relevant_features, selected)
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
      aspect_dialog_update(selected_layers) {
        // todo could be fixed by making multiselects default: []
        if (!selected_layers) {
          selected_layers = []
        }
        const layer_option_values = transform_options_list(this.available_layers).map(o => o.value)
        const layer_statuses = this.$_.mapValues(this.$_.keyBy(layer_option_values), l => selected_layers.includes(l))
        for (let layer in layer_statuses) {
          this.map.setLayoutProperty(layer, 'visibility', layer_statuses[layer] ? "visible" : "none")
        }
        this.$store.commit("map/set_layer_status", selected_layers)
      },
      check_hide_map() {
        if (this.$vuetify.breakpoint.smAndDown) {
          if (this.menu_open && this.menu_state === MENU_MODE_DOMAIN_OVERVIEW) {
            this.map_hidden = true
          } else {
            this.map_hidden = false
          }
        }
      }
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
        if (location) {
          this.map_goto_location(location)
        }
      },
      legend_selection(selection) {
        this.update_filtered_source()
      },
      menu_state(menu_state) {
        this.check_hide_map()
      },
      menu_open(open) {
        this.check_hide_map()
      },
      get_all_uuids(uuids) {
        this.update_filtered_source()
        if (!this.initialized) {
          this.check_entries_map_done()
        }
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
    left: 50%;
    transform: translate(-50%, 0)
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

  .additional_templates_button {
    top: 40px;
    z-index: 30;
    transform: translateX(-50%)
  }
</style>
