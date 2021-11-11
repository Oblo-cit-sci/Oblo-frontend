<template lang="pug">
  div
    client-only
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
import AspectComponentMixin from "~/components/aspects/AspectComponentMixin"
import ResponsivenessMixin from "~/components/ResponsivenessMixin"
import MapIncludeMixin from "~/components/map/MapIncludeMixin"
import Mapbox from "mapbox-gl-vue"

export default {
  name: "GeometryAspect",
  mixins: [AspectComponentMixin, MapIncludeMixin, ResponsivenessMixin],
  components: {Mapbox},
  props: {},
  data() {
    return {
      map_id: "la_" + this._uid,
    }
  },
  computed: {
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
        // bounds from the domain
        if (this.is_editable_mode) {
          const this_entry = this.get_entry()
          const entry_domain = this.$store.getters["domain/cur_act_lang_domain_data"]()
          const domain_init_map_bounds = this.$_.get(entry_domain.map, "init_map_options.bounds")
          if (domain_init_map_bounds) {
            options.bounds = domain_init_map_bounds
          }
        }
        return Object.assign(options, {container: this.map_id})
      }
    },
    show_map() {
      return true
      // assuming edit mode is only on the entry page
      // if (this.is_editable_mode) {
      //   return true
      // } else {
      //   if (this.value === null) {
      //     return false
      //   }
      //   if (this.$route.name === ENTRY) {
      //     return true
      //   } else { // DOMAIN
      //     if (this.is_mdAndUp) {
      //       return false
      //     } else {
      //       return this.menu_state === MENU_MODE_DOMAIN
      //     }
      //   }
      // }
    },
    nav_control_options() {
      if (this.map_loaded)
        return new this.mapboxgl.NavigationControl({showZoom: this.is_editable_mode})
    },
    show_default_layers(){
      return this.$_.get(this.attr,"show_default_layers", true)
    }
  },
  methods: {
    aspect_onMapLoaded(map) {
      this.onMapLoaded(map)
      if (this.value) {
        this.add_layer("l1", this.value.source, this.value.layers, this.show_default_layers)
      }
    },
    map_location_selected(map, mapboxEvent) {
    },
    add_layer(name, source, layers= [], show_default_layers=true) {
      this.map.addSource(name, {
        'type': 'geojson',
        'data': source
      })

      for(let layer of layers) {
        layer.source = name
        this.map.addLayer(layer)
      }

      if(show_default_layers) {
        this.map.addLayer({
          'id': name,
          'type': 'fill',
          'source': name, // reference the data source
          'layout': {},
          'paint': {
            'fill-color': "orange", // blue color fill
            'fill-opacity': 0.5
          }
        })
        this.map.addLayer({
          'id': 'outline',
          'type': 'line',
          'source': name,
          'layout': {},
          'paint': {
            'line-color': '#222',
            'line-width': 2
          }
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
