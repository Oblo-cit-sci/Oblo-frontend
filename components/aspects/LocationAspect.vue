<template lang="pug">
  div.mb-3
    div(v-if="is_editable_mode")
      div.mb-1
        div
          .ml-2.mt-2(v-if="search_location_input_option")
            div {{$t("comp.location_asp.descr")}}
            v-autocomplete(
              v-if="online"
              :search-input.sync="search_query"
              hint="press enter or click the search button"
              append-outer-icon="mdi-magnify"
              @click:append-outer="search_location"
              @keydown="search_keypress($event)"
              @input="selected_search_result = $event"
              @click:clear="clear"
              :loading="btn_loading_search_location"
              :items="search_result_options"
              no-filter
              hide-no-data
              auto-select-first
              v-model="place_select__"
              clearable)
            div(v-else :style="{color: 'red'}") {{$t("comp.location_asp.offline")}}
            div(v-if="value") {{$t("comp.location_asp.public_loc.base")}}:&nbsp;
              span {{public_location_text}}
              v-chip-group(v-if="public_location_selector_on" active-class="primary--text" mandatory v-model="selected_prec_option")
                v-chip(v-for="(place_part, index) in precision_options" :key="index"
                  text-color="black"
                  @click="public_location_precision_selected(index)" active-class="selected_prec_chip") {{place_part}}
              div(v-if="!public_location_selector_on && !location_set && !snap_to_existing")
                v-btn(text small v-if="point_location_precision" @click="activate_custom_privacy_setting") {{$t("comp.location_asp.public_loc.change")}}
                span {{$t("comp.location_asp.public_loc.change_default_setting")}}
                v-btn(text small @click="setting_dialog_open=true") {{$t("w.settings")}}
                AspectDialog(
                  :aspect="location_privacy_setting_aspect"
                  :ext_value="packed_privacy_setting"
                  @update:ext_value="change_default_private_setting($event)"
                  :dialog_open.sync="setting_dialog_open")
    div(v-else)
      span.body-1.readonly-aspect {{place_name_display}}
      v-btn(v-if="show_goto_button" icon @click="set_goto_location")
        v-icon mdi-map-marker
      div(v-if="!value") {{$t('comp.location_asp.no_loc')}}
    client-only
      div(v-if="online")
        .map_overlay
          v-btn(v-if="show_show_my_entries_btn" dark small :color="show_existing ? 'blue' : 'grey'" @click="toggle_show_existing" :loading="getting_my_entries_loading") {{$t('comp.location_asp.show entries')}}
            v-icon mdi-map-marker-circle
        Mapbox.crosshair.mt-3(
          :id="map_id"
          v-if="show_map"
          style="height:400px"
          :access-token="access_token"
          :map-options="map_options"
          @map-load="aspect_onMapLoaded"
          @click="map_location_selected"
          :navControl="nav_control_options")
</template>

<script>

import Mapbox from 'mapbox-gl-vue'
import {
  array2coords,
  create_location_error,
  LOCATION_PRECISION_POINT,
  place2str,
  PREC_OPTION_EXACT,
  PREC_OPTION_RANDOM,
  PREC_OPTION_REGION,
} from "~/lib/location";
import {default_place_type, ENTRY, MENU_MODE_DOMAIN} from "~/lib/consts";
import TriggerSnackbarMixin from "../TriggerSnackbarMixin";
import AspectComponentMixin from "./AspectComponentMixin";
import MapIncludeMixin from "~/components/map/MapIncludeMixin"
import {arr2coords, context_get_place_type, convert_to_2d_arr} from "~/lib/map_utils"
import GeocodingMixin from "~/components/map/GeocodingMixin"
import {mapGetters} from "vuex"
import {settings_loc_privacy_ask, settings_loc_privacy_exact, settings_loc_privacy_random} from "~/lib/settings"
import EntrySearchMixin from "~/components/EntrySearchMixin"
import MapEntriesMixin from "~/components/map/MapEntriesMixin"
import EntryFetchMixin from "~/components/entry/EntryFetchMixin"
import {pack_value, unpack} from "~/lib/aspect"
import ResponsivenessMixin from "~/components/ResponsivenessMixin";
import AspectDialog from "~/components/dialogs/AspectDialog"
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"
import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
import EnvMixin from "~/components/global/EnvMixin"

// "attr.input" options
const DEVICE = "device"
const MAP = "map"
const SEARCH = "search"

// "attr.output" attribute defines what is readable, also what is stored
// default both
const LOCATION = "location" // gps location, just a icon, that shows it on the map
const PLACE = "place" // name of the place
const default_output = [LOCATION, PLACE]

export default {
  name: "LocationAspect",
  components: {AspectDialog, Mapbox},
  mixins: [AspectComponentMixin, TriggerSnackbarMixin, MapIncludeMixin, GeocodingMixin, EnvMixin,
    MapEntriesMixin, EntrySearchMixin, EntryFetchMixin, ResponsivenessMixin, TypicalAspectMixin, PersistentStorageMixin],
  computed: {
    ...mapGetters({logged_in: "user/logged_in", user_settings: "user/settings", menu_state: "menu/menu_state"}),
    device_location_input_option() {
      return this.has_input_option(DEVICE)
    },
    nav_control_options() {
      if (this.map_loaded)
        return new this.mapboxgl.NavigationControl({showZoom: this.is_editable_mode})
    },
    //  check for attr.output.___
    has_output_location() {
      return this.has_output(LOCATION)
    },
    has_output_place() {
      return this.has_output(PLACE)
    },
    has_place() {
      return this.location_set && this.value.place && !this.$_.isEmpty(this.value.place)
    },
    location_privacy_setting() {
      return this.user_settings.location_privacy
    },
    location_set() {
      return this.value !== null
    },
    map_location_input_option() {
      return this.has_input_option(MAP)
    },
    public_precision() {
      return this.value.public_precision
    },
    has_public_loc() {
      return this.location_set && this.value.public_loc
    },
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
        return Object.assign(options, {container: this.map_id})
      }
    },
    // this is for the MapIncludeMixin to show the control
    map_show_geolocate_ctrl() {
      return this.is_editable_mode && this.device_location_input_option
    },
    place_name() {
      // console.log("place_name", this.value)
      if (this.value && this.value.place_name)
        return {text: this.value.place_name, value: this.value.place_name}
    },
    place_name_display() {
      if (this.place_name) {
        return this.place_name.text
      } else {
        return ""
      }
    },
    place_parts() {
      if (!this.has_place)
        return []
      else {
        return this.get_place_parts(this.value.place)
      }
    },
    precision_options() {
      // console.log(this.place_parts)
      return [PREC_OPTION_EXACT, PREC_OPTION_RANDOM].concat(this.place_parts)
    },
    privacy_setting() {
      return this.user_settings.location_privacy
    },
    packed_privacy_setting() {
      return pack_value(this.user_settings.location_privacy)
    },
    show_show_my_entries_btn() {
      return this.logged_in && this.is_editable_mode
    },
    point_location_precision() {
      return this.$_.get(this.value, "location_precision") === LOCATION_PRECISION_POINT
    },
    public_location_selector_on() {
      // console.log("public_location_selector_on", this.location_set, this.point_location_precision, this.privacy_setting, this.custom_privacy_setting)
      return this.location_set &&
        this.point_location_precision &&
        !this.snap_to_existing &&
        (this.privacy_setting === settings_loc_privacy_ask ||
          this.custom_privacy_setting === settings_loc_privacy_ask)
    },
    public_location_text() {
      if (this.value) {
        if (this.point_location_precision) {
          if (this.public_precision === PREC_OPTION_EXACT)
            return this.$t("comp.location_asp.public_loc.options.exact")
          else if (this.public_precision === PREC_OPTION_RANDOM) {
            return this.$t("comp.location_asp.public_loc.options.rnd")
          } else { // PREC_OPTION_REGION
            return this.$t("comp.location_asp.public_loc.options.region")
          }
        } else {
          return this.$t("comp.location_asp.public_loc.options.region")
        }
      } else {
        return ""
      }
    },
    search_location_input_option() {
      return this.has_input_option(SEARCH)
    },
    search_result_options() {
      return this.$_.map(this.search_results, f => {
        return {value: f.id, text: f.place_name}
      })
    },
    show_goto_button() {
      return this.is_view_mode && this.$route.name === "domain" && this.value
    },
    show_map() {
      // assuming edit mode is only on the entry page
      if (this.is_editable_mode) {
        return true
      } else {
        if (this.value === null) {
          return false
        }
        if (this.$route.name === ENTRY) {
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
    show_public_location() {
      if (!this.value)
        return false
      return this.value.public_precision !== PREC_OPTION_EXACT
    },
    location_privacy_setting_aspect() {
      return this.asp_location_privacy()
    }
  },
  data() {
    return {
      map_id: "la_" + this._uid, // every map wrapping element needs a unique id, to keep them separate
      search_query: null,
      initial_autocomplete_reset: 2, // catch first 2 emit of null: ARGH
      place_part_coordinates: {},
      location_marker: null,
      btn_loading_search_location: false, // not sure if this is really effective
      search_results: null,
      selected_search_result: undefined, // this because, clear sets it to that too,
      place_select__: null, // this in v-model is only used because of https://github.com/vuetifyjs/vuetify/issues/11383
      public_location_marker: null,
      show_existing: false,
      getting_my_entries_loading: false,
      my_entries_features: null,
      selected_prec_option: null, // from the chip-menu, index?!
      custom_privacy_setting: null,
      setting_dialog_open: false,
      snap_to_existing: false // snapping to existing entry
    }
  },
  created() {
    // console.log("loc-asp create", this)
    if (this.value) {
      this.search_query = this.value.place_name
      this.place_select__ = this.value.place_name
      this.search_results = [
        {
          id: this.value.place_name,
          place_name: this.value.place_name,
          geometry: {coordinates: convert_to_2d_arr(this.value.coordinates)},
          place_type: [this.value.place_type],
          context: this.value.place
        }]
      // for a draft, set the
      if (this.public_location_selector_on && this.has_public_loc) {
        // debugger
        if (this.point_location_precision &&
          this.value.public_loc.location_precision === LOCATION_PRECISION_POINT &&
          this.$_.isEqual(this.value.coordinates, this.value.public_loc.coordinates)) {
          this.selected_prec_option = 0
        } else {
          if (this.value.public_loc.location_precision === LOCATION_PRECISION_POINT) {
            this.selected_prec_option = 1
          } else {
            this.selected_prec_option = this.place_parts.indexOf(this.value.public_loc.place_name) + 2
          }
        }
      }
      if (this.is_edit_mode) {

      }
    }
  },
  methods: {
    aspect_onMapLoaded(map) {
      this.onMapLoaded(map)
      if (this.value && this.is_editable_mode) {
        this.update_public_location_circle()
      }
    },
    clear() {
      // console.log("clear")
      this.custom_privacy_setting = null
      this.snap_to_existing = false
      this.update_value(null)
    },
    /* query */
    search_keypress(keyEvent) {
      // Enter,  this is the most robust among all platforms (desktop, mobile, chrome, ff)
      if (keyEvent.keyCode === 13) {
        this.search_location()
      }
    },
    async search_result_selected(selection) {
      // console.log("selected_search_result-watch", sel, this.search_results)
      if (!selection) {
        this.snap_to_existing = false
        this.update_value(null)
      } else {
        debugger
        const feature = this.$_.find(this.search_results, feature => feature.id === selection)
        // console.log("srs", feature, feature.place_type[0])

        // TODO dont call this or only use the first part...
        this.complete_value({
          coordinates: arr2coords(feature.geometry.coordinates),
          location_precision: LOCATION_PRECISION_POINT,
        }, feature)
      }
    },
    /* map */
    map_location_selected(map, mapboxEvent) {
      // we are gonna call snap_to_feature, so lets get out here
      // console.log(mapboxEvent)
      // debugger
      if (this.act_hoover_id) {
        return
      }
      if (this.is_view_mode)
        return
      this.custom_privacy_setting = null
      this.search_results = null
      if (this.has_output_place) {
        const coords = {lon: mapboxEvent.lngLat.lng, lat: mapboxEvent.lngLat.lat}
        this.rev_geocode(coords).then(data => {
            // debugger
            if (data.features.length === 0) { // oceans
              // todo add filler
            } else {
              this.complete_value({
                coordinates: coords,
                location_precision: LOCATION_PRECISION_POINT,
              }, data.features)
            }
          }
          , err => {
            console.log(err)
            console.log("no location found")
          }).finally(() => {
        })
      }
    },
    update_marker(flyTo = false) {
      if (this.location_marker) {
        this.location_marker.remove()
      }
      if (this.public_location_marker) {
        this.public_location_marker.remove()
      }
      if (this.show_public_location && this.$_.get(this.value, "public_loc.coordinates")) {
        this.public_location_marker = new this.mapboxgl.Marker({
          color: "#FFF59D"
        })
        this.public_location_marker.setLngLat(this.value.public_loc.coordinates).addTo(this.map)
      }
      const coordinates = this.value.coordinates
      this.location_marker = new this.mapboxgl.Marker()
      this.location_marker.setLngLat(coordinates).addTo(this.map)
      if (flyTo) {
        if (this.value.public_precision === PREC_OPTION_EXACT) {
          this.map.flyTo({
            center: coordinates,
            essential: true // this animation is considered essential with respect to prefers-reduced-motion
          })
        } else {
          const bb = new mapboxgl.LngLatBounds(this.value.coordinates, this.value.public_loc.coordinates)
          this.map.fitBounds(bb, {
            padding: 80,
            maxZoom: 6
          })
        }
      }
    },
    snap_to_feature(features) {
      const feature = features[0]
      const entry_uuid = feature.properties.uuid
      this.guarantee_entry(entry_uuid).then(() => {
        const location = this.$store.getters["entries/entry_location"](entry_uuid)
        console.log(location)
        this.update_value(unpack(location[this.$_.get(feature, "properties.l_id", 0)]))
        this.snap_to_existing = true
      })
    },
    /* device geoloacte */
    geolocate_success(location) {
      console.log("geolocate_success", location)
      if (this.act_hoover_id) {
        return
      }
      this.custom_privacy_setting = null
      this.search_results = null
      this.reset()
      const coordinates = {
        lon: location.coords.longitude,
        lat: location.coords.latitude,
      }
      if (this.has_output_place) {
        this.btn_loading_search_location = true
        this.rev_geocode(coordinates).then(data => {
          // console.log("q", data)
          if (data.features.length === 0) { // oceans
            // todo add filler
          } else {
            this.complete_value({
              coordinates: coordinates,
              location_precision: LOCATION_PRECISION_POINT,
            }, data.features)
          }
        }, err => {
          console.log("error: mapbox api error", err)
        }).finally(() => {
          setTimeout(() => {
            this.btn_loading_search_location = false
          }, 5000)
        })

      }
    },
    geolocate_error() {
      this.error_snackbar("Could not obtain location")
    },
    /* util */
    complete_value(value, features) {
      /*
      value contains just the coordinates
      features should have the results of rev-geoquery of the coordinates
       */
      // console.log("complete with", value)
      if (!value.hasOwnProperty("place")) {
        value.place = {}
      }
      // result from rev-geocoding
      // console.log("complete farray?", features, Array.isArray(features))
      if (Array.isArray(features)) {
        for (let place_type of default_place_type) {
          const place = features.filter(c => c.place_type[0] === place_type)
          if (place.length > 0) {
            value.place[place_type] = {
              name: place[0].text,
              coordinates: array2coords(place[0].geometry.coordinates)
            }
          }
        }
      } else {
        value.place[features.place_type[0]] = {name: features.text, coordinates: value.coordinates}
        for (let place_type of default_place_type) {
          for (let context of features.context || []) {
            const place_type = context_get_place_type(context)
            value.place[place_type] = {name: context.text}
          }
        }
      }
      // from selecting one
      value.place_name = place2str(value.place)
      // console.log("complete", value.place_name)
      let option = PREC_OPTION_RANDOM
      if (this.privacy_setting === settings_loc_privacy_exact) {
        option = PREC_OPTION_EXACT
      }
      // if (!this.point_location_precision) {
      //   // console.log("CC", value.place, value.location_precision, features[0].text)
      //   option = features[0].text// value.place[value.location_precision].name
      // } else {
      if (this.privacy_setting === settings_loc_privacy_ask) {
        this.selected_prec_option = 1
      }
      // }
      // console.log("call get_public_location_from_option", option)
      const public_loc_vars = this.get_public_location_from_option(value, option)
      Object.assign(value, public_loc_vars)
      this.snap_to_existing = false
      this.update_value(value)
      // console.log("complete", value)
    },
    has_input_option(type) {
      return (this.aspect.attr.input || []).includes(type)
    },
    has_output(type) {
      return (this.aspect.attr.output || default_output).includes(type)
    },
    reset() {
      // console.log("reset")
      this.selected_search_result = undefined
      this.search_query = ""
      if (this.location_marker) {
        this.location_marker.remove()
      }
      if (this.public_location_marker) {
        this.public_location_marker.remove()
      }
      this.update_public_location_circle()
    },
    change_default_private_setting(setting_value) {
      console.log("setting_value", setting_value)
      // this.update_button_loading = true
      const existing_settings = Object.assign({}, this.user_settings)
      this.$api.actor.post_me({settings: Object.assign(existing_settings, {[this.location_privacy_setting_aspect.name]: setting_value.value})}).then(({data}) => {
        // console.log(data.settings)
        this.ok_snackbar(this.$t("page.settings.settings_updated"))
        // todo maybe a mixin
        this.$store.commit("user/set_settings", data.settings)
        this.persist_user_settings()

        if (this.public_precision === PREC_OPTION_EXACT && this.location_privacy_setting === settings_loc_privacy_random ||
          this.public_precision === PREC_OPTION_RANDOM && this.location_privacy_setting === settings_loc_privacy_exact) {
          const option = this.location_privacy_setting === settings_loc_privacy_random ? PREC_OPTION_RANDOM : PREC_OPTION_EXACT
          const public_loc_vars = this.get_public_location_from_option(this.value, option)
          this.update_value(Object.assign({}, this.value, public_loc_vars))
        }
      }).catch(err => {
        console.log(err)
      }).finally(() => {
        //this.update_button_loading = false
      })
    },
    public_location_precision_selected(selection_index) {
      // exact or random (dont rely on words, cuz LANGUAGE)
      let public_loc_vars = null
      if (selection_index === 0) {
        public_loc_vars = this.get_public_location_from_option(this.value, PREC_OPTION_EXACT)
      } else if (selection_index === 1) {
        public_loc_vars = this.get_public_location_from_option(this.value, PREC_OPTION_RANDOM)
      } else {
        public_loc_vars = this.get_public_location_from_option(this.value, this.place_parts[selection_index - 2])
      }
      this.update_value(Object.assign({}, this.value, public_loc_vars))
    },
    activate_custom_privacy_setting() {
      if (this.public_precision === PREC_OPTION_EXACT) {
        this.selected_prec_option = 0
      } else if (this.public_precision === PREC_OPTION_RANDOM) {
        this.selected_prec_option = 1
      } else {
        console.log("activate_custom_privacy_setting problem, public precision should either be 'exact' or 'random' but it is ", this.public_precision)
      }
      this.custom_privacy_setting = settings_loc_privacy_ask
    },
    search_location() {
      this.btn_loading_search_location = true
      this.geocode(this.search_query).then(data => {
        this.btn_loading_search_location = false
        if (data.features.length === 0) {
          this.error_snackbar("No place with that name")
        } else {
          this.search_results = data.features.filter(res => res.relevance > 0.34)
        }
      }).catch(err => {
        console.log(err)
        this.btn_loading_search_location = false
      })
    },
    set_goto_location() {
      this.$store.commit("map/goto_location", this.value)
    },
    get_public_location_from_option(value, option) {
      /**
       * value: :Object: existing location value
       * option :string: 'exact', 'random', or <region name>
       * @type {{}}
       */
      const public_loc = {}
      // todo we need this?
      let public_precision = option

      if (option === PREC_OPTION_EXACT) {
        public_loc.coordinates = value.coordinates
        public_loc.location_precision = LOCATION_PRECISION_POINT
        public_loc.place = this.$_.cloneDeep(value.place)
        public_loc.place_name = place2str(public_loc.place)
      } else if (option === PREC_OPTION_RANDOM) {
        public_loc.coordinates = create_location_error(value.coordinates)
        public_loc.location_precision = LOCATION_PRECISION_POINT
        public_loc.place = this.$_.cloneDeep(value.place)
        delete public_loc.place["place"] // remove lowest resolution for privacy
        public_loc.place_name = place2str(public_loc.place)
      } else {
        public_precision = PREC_OPTION_REGION
        public_loc.place = {}
        let add_to_place = false
        for (let place_type of default_place_type) {
          const place = value.place[place_type]
          // console.log(place_type, place)
          if (place) {
            if (place.name === option) {
              public_loc.location_precision = place_type
              public_loc.coordinates = place.coordinates
              add_to_place = true
            }
            if (add_to_place) {
              public_loc.place[place_type] = place
            }
          }
        }
        public_loc.place_name = place2str(public_loc.place)
      }
      return {public_precision, public_loc}
    },
    async guarantee_my_entries_features_loaded() {
      // todo this doesnt work if map_entries hasnt been called before (on domain page)
      if (!this.my_entries_features) {
        this.getting_my_entries_loading = true
        let my_uuids
        try {
          if (!this.$store.getters["map/entries_loaded"]) {
            let [_my_uuids, _] = await Promise.all([this.get_my_entries_uuids(), this.load_map_entries(this.get_entry().domain)]) //
            my_uuids = _my_uuids
          } else {
            my_uuids = await this.get_my_entries_uuids()
          }
        } catch (e) {
          console.log(e)
        }
        this.getting_my_entries_loading = false
        if (Array.isArray(my_uuids)) {
          this.my_entries_features = this.get_map_entries_by_uuids(my_uuids)
          return Promise.resolve()
        } else {
          this.error_snackbar("could not fetch entries")
          return Promise.reject()
        }
      }
    },
    async toggle_show_existing() {
      this.show_existing = !this.show_existing
      if (this.show_existing) {
        if (!this.my_entries_features) {
          await this.guarantee_my_entries_features_loaded()
          this.map.addSource("my_entries_source", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: this.my_entries_features
            },
            generateId: true,
            cluster: true,
            tolerance: 0,
            clusterMaxZoom: 14,
            clusterRadius: 25
          })

          const tt = this
          debugger

          this.add_entry_layer("my_entries_source", "entries_layer", {
            'circle-color': [
              'match',
              ['get', "template"],
              ...this.templates_color_list(this.$store.getters["templates/entry_types_array"]()),
              '#ccc'],
            "circle-radius": [
              'case',
              ["any", ["boolean", ['feature-state', 'hover'], false]],
              12,
              8
            ],
          })
          this.add_default_entries_layer_interactions("my_entries_source", "entries_layer", this.snap_to_feature)
        } else {
          this.map.setLayoutProperty("entries_layer", "visibility", "visible")
        }
      } else {
        if (this.map.getLayer("entries_layer")) {
          this.map.setLayoutProperty("entries_layer", "visibility", "none")
        }
      }
    },
    get_place_parts(place) {
      /**
       * pass a place, or take the one from value
       **/
      const options = []
      for (let place_type of default_place_type) {
        if (place.hasOwnProperty(place_type)) {
          options.push(place[place_type].name)
        }
      }
      return options
    },
    update_public_location_circle() {
      console.log(this.value)
      if (this.location_set && this.value.public_precision === PREC_OPTION_RANDOM) {
        this.public_location_circle()
      } else {
        const circle_layer = this.map.getLayer("public_loc_circle")
        if (circle_layer) {
          this.map.setLayoutProperty("public_loc_circle", "visibility", "none")
        }
      }
    },
    public_location_circle() {
      const circle_around = (coordinate, radius_km, circle_points) => {
        const xc = coordinate["lon"]
        const yc = coordinate["lat"]
        const radius = radius_km / 111
        const dr = (Math.PI * 2) / circle_points
        return [...Array(circle_points + 1).keys()].map(
          i => [xc + Math.cos((i % circle_points) * dr) * radius,
            yc + Math.sin((i % circle_points) * dr) * radius])
      }

      const circle = circle_around(this.value.coordinates, 50, 36)
      const data = {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': circle
        }
      }
      const existing_circle_source = this.map.getSource("circle")
      if (existing_circle_source) {
        existing_circle_source.setData(data)
        this.map.setLayoutProperty("public_loc_circle", "visibility", "visible")
      } else {
        this.map.addSource('circle', {
          'type': 'geojson',
          'data': data
        })
        this.map.addLayer({
          'id': 'public_loc_circle',
          'type': 'line',
          'source': 'circle',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#FFFF00',
            'line-width': 2
          }
        })
      }
    }
  },
  watch: {
    map_loaded() {
      if (this.value && this.value.coordinates) {
        this.update_marker()
      }
    },
    // public_location_precision(selection) {
    //   const option = this.precision_options[selection]
    //   console.log(selection, option)
    //   this.set_public_location_from_option(option)
    // }
    async selected_search_result(sel) {
      this.search_result_selected(sel)
    },
    value(value) {
      console.log("location aspect value watch", value)
      if (!value) {
        this.reset()
        return
      }
      if (this.map_loaded) {
        this.update_marker(true)
        this.update_public_location_circle()
      }
      // this when the value comes down as cache /or in whatever way
      // console.log("value.pn", value.place_name)
      if (value.place_name) {
        this.search_query = value.place_name
      }


    }
  }
}
</script>

<style scoped>

.search_part {
  margin: 6px 8px;
}

.map_overlay {
  position: absolute;
  z-index: 2;
}

.selected_prec_chip {
  background-color: khaki;
}
</style>
