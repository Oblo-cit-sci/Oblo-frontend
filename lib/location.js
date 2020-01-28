import {default_place_type} from "./consts";

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


export function create_location_error(lon, lat, error) {
  //let a_error = error | 1;
  return {
    lon: lon + (Math.random() - 0.5) * error,
    lat: lat + (Math.random() - 0.5) * error
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
  for(let place_type of default_place_type) {
    if(place.hasOwnProperty(place_type)) {
      result_vals.push(place[place_type])
    }
  }
  return result_vals.join(", ")
}
