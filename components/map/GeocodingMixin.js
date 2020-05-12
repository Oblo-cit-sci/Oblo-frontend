import MapboxBaseMixin from "~/components/map/MapboxBaseMixin"
import {default_place_type} from "~/lib/consts"

export default {
  name: "GeocodingMixin",
  mixins: [MapboxBaseMixin],
  data() {
    return {
      mapbox_api_url: "https://api.mapbox.com/geocoding/v5/mapbox.places/"
    }
  },
  methods: {
    async rev_geocode(location, params = {
      place_types: default_place_type
    }) {
      let {data} = await this.$axios.get(encodeURI(this.mapbox_api_url + location.lon + "," + location.lat) + ".json",
        {
          params: {
            access_token: this.access_token,
            types: params.place_types,
            language: "en"
          }
        })
      return data
    },
    async location_search(search_text, params) {
      const {data} = await this.$axios.get(encodeURI(this.mapbox_api_url + search_text) + ".json",
        {
          params: Object.assign({
            access_token: this.access_token
          }, params)
        }
      )
      return data
    }
  }
}
