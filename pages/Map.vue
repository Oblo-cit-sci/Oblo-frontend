<template lang="pug">
  v-layout.map.row
    client-only
      .buttongroup
        v-btn(dark fab bottom right x-large color="blue" @click="drawer = !drawer")
          v-icon mdi-menu
        v-btn(v-if="select_mode" dark fab bottom right large color="warning" @click="back")
          v-icon mdi-arrow-left
        v-btn(v-if="show_select_confirm" dark fab bottom right large color="green" @click="confirm_select")
          v-icon mdi-map-marker-check
      v-navigation-drawer(
        app
        :permanent="drawer"
        v-model="drawer"
        :mini-variant="false"
        :clipped="true"
        :hide-overlay="true"
        temporary
        :width="drawer_width"
        fixed)
      v-snackbar(v-if="selected_place" :value="selected_place" :timeout="0" selected_place right top) {{selected_place_text}}
      MglMap(:style="mapCssStyle"
        :access-token="accessToken"
        :map-style="mapStyle"
        @load="onMapLoaded"
        :center="center_coordinates"
        @click="touch($event)")
        MglMarker(v-if="selected_coordinates" :coordinates="selected_coordinates")
        div(v-for="entry in entries" :key="entry.uuid")
          MglMarker(v-for="(loc, index) in entry.location"
                    :coordinates="transform_loc(loc.coordinates)"
                    :key="index")
</template>

<script>
    import {MglMarker, MglPopup} from "vue-mapbox";
    import {access_token, licci_style_map, rev_geocode} from "../lib/services/mapbox";
    import {MODE_ASPECT_POINT, MODE_NORMAL} from "../lib/consts";
    import {place2str} from "../lib/location";
    import {
        ENTRIES_ALL_ENTRIES_ARRAY,
        ENTRIES_SET_ENTRY_VALUE,
        MAP_SET_ENTRIES,
        SEARCH_GET_ENTRIES
    } from "../lib/store_consts";
    import {pack_value} from "../lib/aspect";
    import {arr2coords} from "../lib/map_utils";
    import {mapGetters} from "vuex"

    const menu_mode_options = [MODE_NORMAL, MODE_ASPECT_POINT]

    export default {
        name: "Map",
        mixins: [],
        components: {MglMarker, MglPopup},
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
                //  MODE_ASPECT_POINT
                selected_coordinates: null,
                selected_place: null
            }
        },
        created() {
            this.map = null
            console.log(this.mode, this.normal_mode)
            if(this.normal_mode) {
                this.$store.dispatch(MAP_SET_ENTRIES, this.$store.getters[ENTRIES_ALL_ENTRIES_ARRAY]())
                // const entries = this.$store.getters[SEARCH_GET_ENTRIES]
                // this.update_map_entries(entries)
                console.log("es", this.entries)
            }
        },
        mounted() {
            this.mapCssStyle = "height: " + document.getElementById("fullContainer").clientHeight + "px"
        },
        computed: {
            ...mapGetters({
                entries: "map/entries",
                layer_status: "map/layer_status"
            }),
            drawer_width() {
                return this.$vuetify.breakpoint.lgAndUp ? 600 : 400
            },
            mode() {
                return this.$route.query.mode || MODE_NORMAL
            },
            select_mode() {
                return this.mode === MODE_ASPECT_POINT
            },
            normal_mode() {
                return this.mode === MODE_NORMAL
            },
            selected_place_text() {
                if (this.selected_place)
                    return place2str(this.selected_place)
                else
                    return ""
            },
            show_select_confirm() {
                return this.selected_place
            }
        },
        methods: {
            onMapLoaded(event) {
                this.map = event.map
                // console.log("map", this.map)
            },
            // todo later use dispatch, like in create?
            update_map_entries(entries) {
                console.log(entries.length)
                this.$store.commit("map/set_entries", entries)
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
            confirm_select() {
                const value = pack_value({
                    coordinates: arr2coords(this.selected_coordinates),
                    place: this.selected_place
                })
                const aspect_loc = this.$store.getters["map/to_select_aspect_location"]
                this.$store.commit("map/reset_to_select_aspect_location")
                this.$store.dispatch(ENTRIES_SET_ENTRY_VALUE, {aspect_loc: aspect_loc, value: value})
                this.$router.back()
            },
            touch({mapboxEvent}) {
                console.log(mapboxEvent.lngLat.lng, mapboxEvent.lngLat.lat)
                if (this.mode === MODE_ASPECT_POINT) {
                    this.selected_coordinates = [mapboxEvent.lngLat.lng, mapboxEvent.lngLat.lat]
                    rev_geocode(this.$axios, {lon: mapboxEvent.lngLat.lng, lat: mapboxEvent.lngLat.lat}).then(data => {
                        this.selected_place = {}
                        if (data.features.length === 0) { // oceans
                            this.selected_place = null
                        } else {
                            this.$_.forEach(data.features, feature => {
                                this.selected_place[feature.place_type[0]] = feature.text
                            })
                        }

                    })
                } else {
                    // this.rev_geocode({lon: mapboxEvent.lngLat.lng, lat: mapboxEvent.lngLat.lat})
                }
            }
        },
        watch: {}
    }
</script>

<style src="mapbox-gl/dist/mapbox-gl.css"></style>

<style scoped>

  .buttongroup {
    top: 2%;
    left: 0.5%;
    position: fixed;
    height: 5%;
    z-index: 1
  }
</style>
