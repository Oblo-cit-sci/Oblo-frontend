import {default_place_type} from "./consts";


export const LOCATION_PRECISION_POINT = "point"
// the default_types are used

export const PREC_OPTION_EXACT = "exact"
export const PREC_OPTION_RANDOM = "random"
export const PREC_OPTION_REGION = "region"

export function get_location(cb) {
  console.log(navigator.geolocation)
  if (navigator.geolocation) {
    return navigator.geolocation.getCurrentPosition(cb, (error) => {
      console.log("error obtaining location", error);
      cb(null)
    }, {}); // timeout:60000
  } else {
    console.log("no geolocation")
  }
}

export function create_location_error(coords, max_km = 50) {
  const lon_err_factor = 2 * max_km / 111.0
  const lat_err_factor = 2 * max_km / 111.0 //max_km / (111.11 * Math.cos(coords.lat / 90 * Math.PI))
  return {
    lon: coords.lon + (Math.random() - 0.5) * lon_err_factor,
    lat: coords.lat + (Math.random() - 0.5) * lat_err_factor
  }
}

export function array2coords(loc_array) {
  return {
    lon: loc_array[0],
    lat: loc_array[1]
  }
}

export function place2str(place) {
  let result_vals = []
  for (let place_type of default_place_type) {
    if (place.hasOwnProperty(place_type)) {
      result_vals.push(place[place_type].name)
    }
  }
  return result_vals.join(", ")
}
