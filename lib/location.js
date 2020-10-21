import {default_place_type} from "./consts";
import {cloneDeep, isEmpty, get} from "lodash"

export const LOCATION_PRECISION_POINT = "point"
// the default_types are used

export const PREC_OPTION_EXACT = "exact"
export const PREC_OPTION_RANDOM = "random"
export const PREC_OPTION_REGION = "region"

export function get_location(cb) {
  // console.log(navigator.geolocation)
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
  /**
   * experiment:
   * @type {number}
   */
  const ang = 2 * Math.random() * Math.PI
  const rad = Math.random() * max_km / 111

  return {
    lon: coords.lon + Math.cos(ang) * rad,
    lat: coords.lat + Math.sin(ang) * rad
  }
}

export function array2coords(loc_array) {
  return {
    lon: loc_array[0],
    lat: loc_array[1]
  }
}

export function coords2array(coords) {
  return [coords.lon, coords.lat]
}

export function place2str(place) {
  // console.log("p2s",place)
  let result_vals = []
  for (let place_type of default_place_type) {
    if (place.hasOwnProperty(place_type)) {
      result_vals.push(place[place_type].name)
    }
  }
  return result_vals.join(", ")
}

export function entry_location2geojson_arr(entry, include_props = []) {
  const location = entry.location
  const base_properties = {
    uuid: entry.uuid,
    template: entry.template.slug,
    title: entry.title,
    tags: entry.tags,
    location
  }

  for (let prop of include_props) {
    base_properties[prop] = get(entry, prop)
  }

  const features = []
  for (let i in location) {
    features.push({
      type: "Feature",
      geometry: {
        type: "Point", "coordinates": coords2array(location[i].coordinates)
      },
      properties: Object.assign({l_id: parseInt(i)}, base_properties)
    })
  }

  return features
}

export function common_place_name(features) {

  const consider_place_types = cloneDeep(default_place_type)
  const places = {}

  for (let feature of features) {
    // todo, location[0] ????!
    const loc = feature.properties.location[feature.properties.l_id]

    if (isEmpty(places)) {
      for (let pt of consider_place_types) {
        if (loc.place[pt]) {
          places[pt] = loc.place[pt].name
        } else {
          consider_place_types.splice(consider_place_types.indexOf(pt), 1)
        }
      }
      // console.log(loc, "place?", places)
    } else {
      // console.log("after1,", consider_place_types, places)
      // console.log(loc)
      for (let pt of consider_place_types) {
        if (loc.place[pt]) {
          if (loc.place[pt].name !== places[pt]) {
            consider_place_types.splice(consider_place_types.indexOf(pt), 1)
          }
        } else {
          // console.log("kickout", pt, "for",loc.place)
          consider_place_types.splice(consider_place_types.indexOf(pt), 1)
        }
      }
    }
    // console.log("le", consider_place_types.length)
    if (consider_place_types.length === 0) {
      return null
    }
  }

  if (consider_place_types.length > 0) {
    return places[consider_place_types[0]]
  }
}

export function get_all_countries(features) {
  const countries = new Set()
  for (let feature of features) {
    const loc = feature.properties.location[feature.properties.l_id]
    const country = get(loc, "place.country", null)
    if (country) {
      countries.add(country.name)
    }
  }
  return countries
}

export function get_closest_coordinates(coordinate, coordinates) {
  let closestIndex = -1
  let closestDist = 1000000
  for (let index in coordinates) {
    const ind_coord = coordinates[index]
    const dist_sq = Math.pow(coordinate.lon - ind_coord.lon, 2) + Math.pow(coordinate.lat - ind_coord.lat, 2)
    if (dist_sq < closestDist) {
      closestDist = dist_sq
      closestIndex = index
    }
  }
  return closestIndex
}
