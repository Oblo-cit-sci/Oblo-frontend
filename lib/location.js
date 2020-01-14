export function get_location(cb) {
  if (navigator.geolocation) {
    return navigator.geolocation.getCurrentPosition(cb, (error) => {
      console.log("error obtaining location", error);
    });
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
