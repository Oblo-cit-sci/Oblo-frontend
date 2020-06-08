import {unpack} from "./aspect";

export const LAYER_BASE_ID = "all_entries"

export function is_2d_arr(value) {
  const v = unpack(value)
  return Array.isArray(v) && v.length === 2 && typeof v[0] === "number" && typeof v[1] === "number"
}

export function is_gps_obj(value) {
  const v = unpack(value)
  // console.log(v)
  return typeof v === "object" && v.lon && typeof v.lon === "number" && typeof v.lat === "number"
}

export function value_is_coord(value) {
  return is_2d_arr || is_gps_obj(value)
}

export function convert_to_2d_arr(value) {
  const v = unpack(value)
  if (is_gps_obj(v))
    return [value.lon, value.lat]
  else if (is_2d_arr(v))
    return v
}

export function latLng_2_2d_arr(coord) {
  return [coord.lng, coord.lat]
}

export function arr2coords(arr) {
  return {lon: arr[0], lat: arr[1]}
}

export function arr_loc_dist_square(a, b) {
  return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)
}

export function closest_point(src, points) {
  const coords_distances = points.map(c => arr_loc_dist_square(src, c))
  const closest = Math.min(...coords_distances)
  const closest_index = coords_distances.findIndex(d => d === closest)
  return points[closest_index].slice()
}

export function mapboxgl_lngLat2coords(lngLat) {
  return {lon: lngLat.lng, lat: lngLat.lat}
}


export function place_feature2place(feature) {
  const place = {}
  for (let place_type of feature.place_type) {
    place[place_type] = feature.text
  }
  for (let context of feature.context || []) {
    const place_type = context_get_place_type(context)
    place[place_type] = context.text
  }
  return place
}

export function context_get_place_type(context) {
  return context.id.split(".")[0]
}

export function place2str(place) {
  let result_arr = []
  for (let t of default_place_type) {
    if (t.hasOwnProperty(place)) {
      result_arr.push(place[t])
    }
    return result_arr.join(", ")
  }
}
