const nomination_api_url = "https://nominatim.openstreetmap.org/reverse"

export async function alt_rev_geocode(axios, location) {
  let {data} = await axios.get(encodeURI(nomination_api_url),
    {
      params: {
        lat: location.lat,
        lon: location.lon,
        zoom: 10,
        addressdetails: 1,
        format: "json"
      }
    })
  return data
}
