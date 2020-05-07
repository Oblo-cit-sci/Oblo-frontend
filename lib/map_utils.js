import {unpack} from "./aspect";


export function is_2d_arr(value) {
  const v = unpack(value)
  return Array.isArray(v) && v.length === 2 && typeof v[0] === "number" && typeof v[1] === "number"
}

export function is_gps_obj(value) {
  const v = unpack(value)
  return typeof value === "object" && value.lon && typeof v.lon === "number" && typeof v.lat === "number"
}

export function value_is_coord(value) {
  return is_2d_arr || is_gps_obj(value)
}

export function convert_to_2d_arr(value) {
  if (is_gps_obj(value))
    return [value.value.lon, value.value.lat]
  else if (is_2d_arr())
    return unpack(value)
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
