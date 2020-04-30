export const access_token = "pk.eyJ1IjoicmFtaW4taWN0YSIsImEiOiJjanVkdDluMWswNW82NDFwaHJlZTIwbWZ6In0.MBQHMDkvg96WE74tuB87Zg"
export const licci_style_map = "mapbox://styles/ramin-icta/cjuazr4bx01fp1fkwdko87m2d"

//export const licci_style_map = "mapbox://styles/ramin36/cjx2xkz2w030s1cmumgp6y1j8"

// mapbox://styles/ramin-icta/cjuazr4bx01fp1fkwdko87m2d
// mapbox://styles/ramin36/cjx2xkz2w030s1cmumgp6y1j8
const mapbox_api_url = "https://api.mapbox.com/geocoding/v5/mapbox.places/"

export async function rev_geocode(axios, location, params = {
  place_types: ["country", "region", "district", "place", "locality"]
}) {
  let {data} = await axios.get(encodeURI(mapbox_api_url + location.lon + "," + location.lat) + ".json",
    {
      params: {
        access_token: access_token,
        types: params.place_types
      }
    })
  return data
}

export async function location_search(axios, search_text, params) {
  const {data} = await axios.get(encodeURI(mapbox_api_url + search_text) + ".json",
    {
      params: Object.assign({
        access_token: access_token
      }, params)
    }
  )
  return data
}
