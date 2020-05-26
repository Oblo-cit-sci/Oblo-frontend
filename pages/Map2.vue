<template lang="pug">
  div#mapC
    mapbox#map(
      :access-token="access_token"
      :map-options="default_map_options"
      @map-load="onMapLoaded")
</template>

<script>
  import Mapbox from 'mapbox-gl-vue'

  import MapIncludeMixin from "~/components/map/MapIncludeMixin"

  export default {
    name: "Map2",
    layout: "map_layout",
    mixins: [MapIncludeMixin],
    components: {Mapbox},
    data() {
      return {
        act_popup: null,
        act_hoover_id: null
      }
    },
    watch: {
      map_loaded() {
        this.map.addSource("e", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                "type": "Feature",
                "id": 0,
                "geometry": {"type": "Point", "coordinates": [-164.25, 65.333333]},
                "properties": {
                  "title": "Perception of change in freshwater in remote resource-dependent Arctic communities",
                  "tags": {
                    "climatic zone": ["Polar climate"],
                    "elements": ["Changes in freshwater quality (not further specified)", "Changes in freshwater availability"]
                  },
                  "languages": []
                }
              }
            ]
          },
        })

        this.map.addLayer({
          'id': "el",
          'type': 'circle',
          'source': "e",
          'paint': {
            "circle-opacity": 1,
            'circle-color': '#ccc',
            "circle-radius": 16,
            "circle-stroke-color": "#f6ff7a",
            "circle-stroke-width": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              2,
              0
            ]
          }
        })

        this.map.addLayer({
          id: 'count',
          type: 'symbol',
          source: "e",
          layout: {
            "text-allow-overlap": true,
            "text-ignore-placement": true,
            'text-field': '10',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 14
          }
        })

        this.map.on('mouseenter', "el", (e) => {

          if (this.act_popup) {
            this.act_popup.remove()
          }

          const feature = e.features[0]
          let coordinates = feature.geometry.coordinates.slice()
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
          }

          this.act_hoover_id = feature.id
          this.map.setFeatureState(
            {source: "e", id: this.act_hoover_id},
            {hover: true}
          )
          this.act_popup = new this.mapboxgl.Popup()
            .setLngLat({ lng: coordinates[0], lat: coordinates[1] })
            .setText(feature.properties.title)
            .addTo(this.map)
        })


      }
    }
  }
</script>

<style scoped>

  #mapC {
    width: 100%;
    height: 100%;
  }

  #map {
    width: 100%;
    height: 100%;
  }
</style>
