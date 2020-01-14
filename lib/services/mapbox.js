export const access_token = "pk.eyJ1IjoicmFtaW4zNiIsImEiOiJjamJ0eGo0cWQxbHo1MzJyMnV0bzhydjhzIn0.-q0FF4Jtuhc-wboaSA2E_A"
export const licci_style_map = "mapbox://styles/ramin36/cjx2xkz2w030s1cmumgp6y1j8"
// mapbox://styles/ramin36/cjx2xkz2w030s1cmumgp6y1j8
const mapbox_api_url = "https://api.mapbox.com/geocoding/v5/mapbox.places/"

export async function rev_geocode(axios, location, params = {
  place_types: ["country", "region", "district", "locality"]
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
